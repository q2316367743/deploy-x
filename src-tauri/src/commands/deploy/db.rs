use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::sync::OnceLock;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Manager};

static POOL: OnceLock<SqlitePool> = OnceLock::new();
static RUNNING_TASKS: OnceLock<std::sync::Mutex<std::collections::HashMap<String, std::sync::Arc<AtomicBool>>>> = OnceLock::new();

pub fn running_tasks() -> &'static std::sync::Mutex<std::collections::HashMap<String, std::sync::Arc<AtomicBool>>> {
    RUNNING_TASKS.get().expect("Running tasks map not initialized")
}

pub fn init_running_tasks() -> Result<(), String> {
    RUNNING_TASKS.set(std::sync::Mutex::new(std::collections::HashMap::new()))
        .map_err(|_| "Running tasks map already initialized".to_string())
}

pub fn register_running_task(record_id: String, cancel_flag: std::sync::Arc<AtomicBool>) {
    let mut tasks = running_tasks().lock().unwrap();
    tasks.insert(record_id, cancel_flag);
}

pub fn unregister_running_task(record_id: &str) {
    let mut tasks = running_tasks().lock().unwrap();
    tasks.remove(record_id);
}

#[allow(dead_code)]
pub fn is_task_running(record_id: &str) -> bool {
    let tasks = running_tasks().lock().unwrap();
    tasks.get(record_id).map(|f| !f.load(Ordering::Relaxed)).unwrap_or(false)
}

/// 迁移文件描述
struct MigrateFile {
    file: &'static str,
    version: i64,
}

/// 日志数据库迁移文件列表
const LOG_MIGRATE_FILES: &[MigrateFile] = &[
    MigrateFile { file: "lib/migrate/1000.sql", version: 0 },
];

pub async fn init_pool(app: &AppHandle) -> Result<(), String> {
    let db_path = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("获取应用数据目录失败: {}", e))?
        .join("db")
        .join("log.sqlite");

    // 确保目录存在
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("创建数据库目录失败: {}", e))?;
    }

    let db_url = format!("sqlite://{}", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect(&db_url)
        .await
        .map_err(|e| format!("连接数据库失败: {}", e))?;

    // 执行数据库迁移
    migrate(&pool).await?;

    POOL.set(pool)
        .map_err(|_| "数据库池已初始化".to_string())?;

    init_running_tasks()?;

    Ok(())
}

async fn migrate(pool: &SqlitePool) -> Result<(), String> {
    // 1. 检查 schema_version 表是否存在
    log::info!("[sql] 1. 检查 schema_version 表是否存在");
    let row: Option<(String,)> = sqlx::query_as(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version';"
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("查询 schema_version 表失败: {}", e))?;

    if row.is_none() {
        log::info!("[sql] 表不存在，创建 schema_version 表");
        sqlx::query(
            "CREATE TABLE schema_version (version INTEGER PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
        )
        .execute(pool)
        .await
        .map_err(|e| format!("创建 schema_version 表失败: {}", e))?;
    } else {
        log::info!("[sql] 表已存在，跳过创建");
    }

    // 2. 获取当前版本
    log::info!("[sql] 2. 获取当前版本");
    let current: (i64,) = sqlx::query_as(
        "SELECT COALESCE(MAX(version), -1) AS version FROM schema_version;"
    )
    .fetch_one(pool)
    .await
    .map_err(|e| format!("查询当前版本失败: {}", e))?;
    log::info!("[sql] 当前版本: {}", current.0);

    // 3. 找出待应用的迁移文件
    let mut pending: Vec<&MigrateFile> = LOG_MIGRATE_FILES
        .iter()
        .filter(|m| m.version > current.0)
        .collect();
    pending.sort_by_key(|m| m.version);

    // 4. 依次应用迁移
    for mf in pending {
        let resource_path = std::env::current_exe()
            .map_err(|e| format!("获取可执行文件路径失败: {}", e))
            .and_then(|mut p| {
                p.pop(); // 移除可执行文件名
                p.push("lib");
                p.push(mf.file);
                if p.exists() {
                    Ok(p)
                } else {
                    Err(format!("迁移文件不存在: {}", mf.file))
                }
            });

        let resource_path = match resource_path {
            Ok(p) => p,
            Err(_) => {
                // 尝试从当前工作目录查找
                let p = std::path::PathBuf::from(mf.file);
                if p.exists() { p } else {
                    return Err(format!("找不到迁移文件: {}", mf.file));
                }
            }
        };

        let sql = std::fs::read_to_string(&resource_path)
            .map_err(|e| format!("读取迁移文件 {} 失败: {}", mf.file, e))?;

        log::info!("[sql] 开始处理文件：{}, 版本：{}", mf.file, mf.version);

        // 开启事务
        let mut tx = pool.begin().await.map_err(|e| format!("开启事务失败: {}", e))?;

        // 执行迁移 SQL（可能包含多条语句）
        for statement in split_sql(&sql) {
            if statement.trim().is_empty() {
                continue;
            }
            sqlx::query(&statement)
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("执行迁移 SQL 失败 ({}): {}", mf.file, e))?;
        }

        // 记录版本
        sqlx::query("INSERT INTO schema_version(version) VALUES (?1)")
            .bind(mf.version)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("记录版本失败: {}", e))?;

        tx.commit().await.map_err(|e| format!("事务提交失败: {}", e))?;

        log::info!("[sql] ✅ migration {} applied", mf.file);
    }

    Ok(())
}

/// 简单的 SQL 分割器，按分号分割多条语句
fn split_sql(sql: &str) -> Vec<String> {
    let mut statements = Vec::new();
    let mut current = String::new();

    for line in sql.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("--") {
            continue;
        }

        if !current.is_empty() {
            current.push(' ');
        }
        current.push_str(line);

        if line.ends_with(';') {
            statements.push(std::mem::take(&mut current));
        }
    }

    if !current.is_empty() {
        statements.push(current);
    }

    statements
}

pub fn get_pool() -> Result<&'static SqlitePool, String> {
    POOL.get().ok_or_else(|| "数据库池未初始化".to_string())
}
