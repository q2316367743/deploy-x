use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use std::path::Path;
use std::io::{Read, Write};
use tokio::io::AsyncBufReadExt;
use tokio::process::Command;
use crate::commands::deploy::db::{get_pool, register_running_task, unregister_running_task};

#[derive(Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct DeployInvokeProp {
    pub script: DeployScriptView,
    pub host: HostCore,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeployScriptView {
    pub id: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub project_id: String,
    pub instance_id: String,
    pub name: String,
    pub script_type: String,
    pub description: String,
    pub local_work_dir: String,
    pub local_commands: String,
    pub build_output_dir: String,
    pub scan_depth: String,
    pub match_mode: String,
    pub match_rules: Vec<String>,
    pub target_host_id: String,
    pub target_dir: String,
    pub keep_versions: i64,
    pub deploy_path: String,
    pub pre_deploy_commands: String,
    pub post_deploy_commands: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HostCore {
    pub name: String,
    pub host: String,
    pub port: i64,
    pub auth_type: String,
    pub auth_user: String,
    pub auth_password: String,
    pub auth_secret: String,
    pub credential_id: String,
    pub remark: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
struct DeployRecord {
    id: String,
    created_at: i64,
    updated_at: i64,
    project_id: String,
    instance_id: String,
    deploy_id: String,
    script_id: String,
    status: String,
    error_summary: String,
    started_at: String,
    finished_at: String,
}

fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{}-{}", duration.as_millis(), rand::random::<u32>())
}

fn now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64
}

fn now_str() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let secs = duration.as_secs();
    #[allow(deprecated)]
    let naive = chrono::NaiveDateTime::from_timestamp(secs as i64, 0);
    naive.format("%Y-%m-%d %H:%M:%S").to_string()
}

async fn insert_log(
    pool: &sqlx::SqlitePool,
    project_id: &str, instance_id: &str, deploy_id: &str, record_id: &str, step_id: &str,
    line_num: i64, stream: &str, content: &str,
) -> Result<(), String> {
    let now = now_ms();
    sqlx::query(
        "INSERT INTO deploy_log (project_id, instance_id, deploy_id, record_id, step_id, line_num, stream, content, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"
    )
    .bind(project_id).bind(instance_id).bind(deploy_id).bind(record_id).bind(step_id)
    .bind(line_num).bind(stream).bind(content).bind(now).bind(now)
    .execute(pool).await.map_err(|e| format!("插入日志失败: {}", e))?;
    Ok(())
}

async fn update_step_status(
    pool: &sqlx::SqlitePool, step_id: &str, status: &str,
    started_at: Option<&str>, finished_at: Option<&str>, error: Option<&str>,
) -> Result<(), String> {
    let now = now_ms();
    if let Some(err) = error {
        sqlx::query("UPDATE deploy_step SET status = ?1, updated_at = ?2, started_at = ?3, finished_at = ?4, error = ?5 WHERE id = ?6")
            .bind(status).bind(now).bind(started_at).bind(finished_at).bind(err).bind(step_id)
            .execute(pool).await.map_err(|e| format!("更新步骤状态失败: {}", e))?;
    } else if started_at.is_some() && finished_at.is_some() {
        sqlx::query("UPDATE deploy_step SET status = ?1, updated_at = ?2, started_at = ?3, finished_at = ?4 WHERE id = ?5")
            .bind(status).bind(now).bind(started_at.unwrap()).bind(finished_at.unwrap()).bind(step_id)
            .execute(pool).await.map_err(|e| format!("更新步骤状态失败: {}", e))?;
    } else if started_at.is_some() {
        sqlx::query("UPDATE deploy_step SET status = ?1, updated_at = ?2, started_at = ?3 WHERE id = ?4")
            .bind(status).bind(now).bind(started_at.unwrap()).bind(step_id)
            .execute(pool).await.map_err(|e| format!("更新步骤状态失败: {}", e))?;
    } else {
        sqlx::query("UPDATE deploy_step SET status = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(status).bind(now).bind(step_id)
            .execute(pool).await.map_err(|e| format!("更新步骤状态失败: {}", e))?;
    }
    Ok(())
}

/// Mark all remaining pending/running steps as failed
async fn fail_remaining_steps(
    pool: &sqlx::SqlitePool, step_ids: &[String], current_idx: usize, error_msg: &str,
) -> Result<(), String> {
    let now = now_ms();
    let finished = now_str();
    for (i, sid) in step_ids.iter().enumerate() {
        if i >= current_idx {
            sqlx::query(
                "UPDATE deploy_step SET status = 'failed', updated_at = ?1, finished_at = ?2, error = ?3
                 WHERE id = ?4 AND status IN ('pending', 'running')"
            )
            .bind(now).bind(&finished).bind(error_msg).bind(sid)
            .execute(pool).await.map_err(|e| format!("更新步骤状态失败: {}", e))?;
        }
    }
    Ok(())
}

async fn update_record_status(
    pool: &sqlx::SqlitePool, record_id: &str, status: &str,
    error_summary: Option<&str>, finished_at: Option<&str>,
) -> Result<(), String> {
    let now = now_ms();
    if let Some(err) = error_summary {
        sqlx::query("UPDATE deploy_record SET status = ?1, error_summary = ?2, updated_at = ?3, finished_at = ?4 WHERE id = ?5")
            .bind(status).bind(err).bind(now).bind(finished_at).bind(record_id)
            .execute(pool).await.map_err(|e| format!("更新记录状态失败: {}", e))?;
    } else if let Some(finished) = finished_at {
        sqlx::query("UPDATE deploy_record SET status = ?1, updated_at = ?2, finished_at = ?3 WHERE id = ?4")
            .bind(status).bind(now).bind(finished).bind(record_id)
            .execute(pool).await.map_err(|e| format!("更新记录状态失败: {}", e))?;
    } else {
        sqlx::query("UPDATE deploy_record SET status = ?1, updated_at = ?2 WHERE id = ?3")
            .bind(status).bind(now).bind(record_id)
            .execute(pool).await.map_err(|e| format!("更新记录状态失败: {}", e))?;
    }
    Ok(())
}

fn parse_commands(commands: &str) -> Vec<String> {
    commands.lines().map(|s| s.trim()).filter(|s| !s.is_empty()).map(|s| s.to_string()).collect()
}

async fn execute_local_commands(
    pool: &sqlx::SqlitePool,
    project_id: &str, instance_id: &str, deploy_id: &str, record_id: &str, step_id: &str,
    work_dir: &str, commands: &str, cancel_flag: &Arc<AtomicBool>,
) -> Result<(), String> {
    let cmd_lines = parse_commands(commands);
    let mut line_counter: i64 = 0;

    for cmd in cmd_lines {
        if cancel_flag.load(Ordering::Relaxed) {
            return Err("用户取消执行".to_string());
        }

        let log_line = format!("$ {}\n", cmd);
        line_counter += 1;
        insert_log(pool, project_id, instance_id, deploy_id, record_id, step_id, line_counter, "stdout", &log_line).await?;

        let mut child = Command::new("sh")
            .arg("-c")
            .arg(&cmd)
            .current_dir(work_dir)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("执行命令失败 '{}': {}", cmd, e))?;

        if let Some(stdout) = child.stdout.take() {
            let mut reader = tokio::io::BufReader::new(stdout).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                if cancel_flag.load(Ordering::Relaxed) {
                    let _ = child.kill().await;
                    return Err("用户取消执行".to_string());
                }
                line_counter += 1;
                insert_log(pool, project_id, instance_id, deploy_id, record_id, step_id, line_counter, "stdout", &line).await?;
            }
        }

        if let Some(stderr) = child.stderr.take() {
            let mut reader = tokio::io::BufReader::new(stderr).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                line_counter += 1;
                insert_log(pool, project_id, instance_id, deploy_id, record_id, step_id, line_counter, "stderr", &line).await?;
            }
        }

        let status = child.wait().await.map_err(|e| format!("等待命令完成失败 '{}': {}", cmd, e))?;
        if !status.success() {
            return Err(format!("命令执行失败 '{}', 退出码: {:?}", cmd, status.code()));
        }
    }
    Ok(())
}

fn collect_files(base_dir: &Path, scan_depth: &str, match_mode: &str, match_rules: &[String]) -> Vec<std::path::PathBuf> {
    let mut files = Vec::new();
    let max_depth = if scan_depth == "shallow" { 1 } else { usize::MAX };

    fn walk(dir: &Path, current_depth: usize, max_depth: usize, files: &mut Vec<std::path::PathBuf>) {
        if current_depth >= max_depth { return; }
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() { files.push(path.clone()); }
                else if path.is_dir() { walk(&path, current_depth + 1, max_depth, files); }
            }
        }
    }

    walk(base_dir, 0, max_depth, &mut files);

    if match_mode != "all" && !match_rules.is_empty() {
        files.retain(|f| {
            let path_str = f.to_string_lossy();
            let file_name = f.file_name().map(|s| s.to_string_lossy()).unwrap_or_default();
            match match_mode {
                "include" => match_rules.iter().any(|r| glob_match(r, &path_str) || glob_match(r, &file_name)),
                "exclude" => !match_rules.iter().any(|r| glob_match(r, &path_str) || glob_match(r, &file_name)),
                _ => true,
            }
        });
    }
    files
}

fn glob_match(pattern: &str, text: &str) -> bool {
    if pattern.contains("**") {
        let parts: Vec<&str> = pattern.split("**").collect();
        if parts.len() == 2 {
            return text.contains(parts[0]) && (parts[1].is_empty() || text.ends_with(parts[1]));
        }
    }
    if pattern.contains("*") {
        let parts: Vec<&str> = pattern.split('*').collect();
        let mut pos = 0;
        for part in &parts {
            if part.is_empty() { continue; }
            match text[pos..].find(part) {
                Some(idx) => pos += idx + part.len(),
                None => return false,
            }
        }
        return true;
    }
    text.contains(pattern) || text.ends_with(pattern)
}

async fn copy_files_to_dir(
    pool: &sqlx::SqlitePool,
    project_id: &str, instance_id: &str, deploy_id: &str, record_id: &str, step_id: &str,
    source_dir: &Path, files: &[std::path::PathBuf], target_dir: &str,
    cancel_flag: &Arc<AtomicBool>,
) -> Result<(), String> {
    std::fs::create_dir_all(target_dir).map_err(|e| format!("创建目标目录失败 {}: {}", target_dir, e))?;
    let mut line_counter: i64 = 0;

    for file in files {
        if cancel_flag.load(Ordering::Relaxed) { return Err("用户取消执行".to_string()); }

        let rel_path = file.strip_prefix(source_dir)
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| file.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default());

        let dest = Path::new(target_dir).join(&rel_path);
        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("创建目录失败 {}: {}", parent.display(), e))?;
        }

        let log_msg = format!("Copying: {} -> {}", rel_path, dest.display());
        line_counter += 1;
        insert_log(pool, project_id, instance_id, deploy_id, record_id, step_id, line_counter, "stdout", &log_msg).await?;

        std::fs::copy(file, &dest).map_err(|e| format!("复制文件失败 {} -> {}: {}", file.display(), dest.display(), e))?;
    }
    Ok(())
}

// ============== SSH functions using ssh2 crate ==============

fn ssh_connect(host: &HostCore) -> Result<ssh2::Session, String> {
    use std::net::TcpStream;
    let addr = format!("{}:{}", host.host, host.port);
    let tcp = TcpStream::connect(&addr).map_err(|e| format!("TCP 连接失败 {}: {}", addr, e))?;
    let mut sess = ssh2::Session::new().map_err(|e| format!("创建 SSH 会话失败: {}", e))?;
    sess.set_tcp_stream(tcp);
    sess.handshake().map_err(|e| format!("SSH 握手失败: {}", e))?;

    if host.auth_type == "password" || host.auth_type == "credential" {
        sess.userauth_password(&host.auth_user, &host.auth_password)
            .map_err(|e| format!("SSH 密码认证失败: {}", e))?;
    } else if host.auth_type == "secret" {
        sess.userauth_pubkey_memory(&host.auth_user, None, &host.auth_secret,
            if host.auth_password.is_empty() { None } else { Some(&host.auth_password[..]) },
        ).map_err(|e| format!("SSH 密钥认证失败: {}", e))?;
    } else {
        return Err(format!("不支持的认证类型: {}", host.auth_type));
    }

    Ok(sess)
}

fn ssh_exec_remote(
    sess: &ssh2::Session,
    commands: &[String],
    mut log_callback: impl FnMut(i64, &str, &str) -> Result<(), String>,
    cancel_flag: &Arc<AtomicBool>,
) -> Result<(), String> {
    let mut line_counter: i64 = 0;

    for cmd in commands {
        if cancel_flag.load(Ordering::Relaxed) {
            return Err("用户取消执行".to_string());
        }

        let log_line = format!("$ {}\n", cmd);
        line_counter += 1;
        log_callback(line_counter, "stdout", &log_line)?;

        let mut channel = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
        channel.exec(cmd).map_err(|e| format!("执行 SSH 命令失败 '{}': {}", cmd, e))?;

        let mut stdout = String::new();
        channel.read_to_string(&mut stdout).map_err(|e| format!("读取 SSH 输出失败: {}", e))?;

        for line in stdout.lines() {
            line_counter += 1;
            log_callback(line_counter, "stdout", line)?;
        }

        channel.wait_close().map_err(|e| format!("等待 SSH 命令完成失败: {}", e))?;
        let exit_status = channel.exit_status().map_err(|e| format!("获取退出码失败: {}", e))?;

        if exit_status != 0 {
            return Err(format!("远程命令执行失败 '{}', 退出码: {}", cmd, exit_status));
        }
    }

    Ok(())
}

async fn execute_remote_commands(
    project_id: String, instance_id: String, deploy_id: String, record_id: String, step_id: String,
    host: HostCore, commands: String, cancel_flag: Arc<AtomicBool>,
) -> Result<(), String> {
    let cmd_lines = parse_commands(&commands);

    tokio::task::spawn_blocking(move || {
        let sess = ssh_connect(&host)?;

        ssh_exec_remote(&sess, &cmd_lines, |line_num, stream, content| {
            let pool = get_pool().map_err(|e| e.to_string())?;
            let content = content.to_string();
            let stream = stream.to_string();

            // Use a separate thread to run the async insert
            let project_id = project_id.clone();
            let instance_id = instance_id.clone();
            let deploy_id = deploy_id.clone();
            let record_id = record_id.clone();
            let step_id = step_id.clone();

            // We're already in spawn_blocking, so we can use block_on safely
            let rt = tokio::runtime::Handle::try_current().map_err(|e| e.to_string())?;
            rt.block_on(async {
                insert_log(&pool, &project_id, &instance_id, &deploy_id, &record_id, &step_id,
                           line_num, &stream, &content).await
            })
        }, &cancel_flag)
    }).await.map_err(|e| format!("SSH 任务执行失败: {}", e))?
}

async fn copy_files_via_ssh(
    project_id: String, instance_id: String, deploy_id: String, record_id: String, step_id: String,
    host: HostCore, source_dir: std::path::PathBuf, files: Vec<std::path::PathBuf>, target_dir: String,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let sess = ssh_connect(&host)?;

        // Create target directory
        let mkdir_cmd = format!("mkdir -p {}", target_dir);
        let mut channel = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
        channel.exec(&mkdir_cmd).map_err(|e| format!("执行命令失败: {}", e))?;
        channel.wait_close().map_err(|e| format!("等待命令完成失败: {}", e))?;

        let mut line_counter: i64 = 0;

        let log_cb = |lc: &mut i64, stream: &str, content: &str| -> Result<(), String> {
            *lc += 1;
            let pool = get_pool().map_err(|e| e.to_string())?;
            let rt = tokio::runtime::Handle::try_current().map_err(|e| e.to_string())?;
            let content = content.to_string();
            let stream = stream.to_string();
            let project_id = project_id.clone();
            let instance_id = instance_id.clone();
            let deploy_id = deploy_id.clone();
            let record_id = record_id.clone();
            let step_id = step_id.clone();

            rt.block_on(async {
                insert_log(&pool, &project_id, &instance_id, &deploy_id, &record_id, &step_id,
                           *lc, &stream, &content).await
            })
        };

        for file in &files {
            if cancel_flag.load(Ordering::Relaxed) {
                return Err("用户取消执行".to_string());
            }

            let rel_path = file.strip_prefix(&source_dir)
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| file.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default());

            let dest = std::path::Path::new(&target_dir).join(&rel_path);

            if let Some(parent) = dest.parent() {
                let mkdir_p = format!("mkdir -p {}", parent.display());
                let mut ch = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
                let _ = ch.exec(&mkdir_p);
                let _ = ch.wait_close();
            }

            let log_msg = format!("Uploading: {} -> {}", rel_path, dest.display());
            log_cb(&mut line_counter, "stdout", &log_msg)?;

            let data = std::fs::read(file).map_err(|e| format!("读取本地文件失败 {}: {}", file.display(), e))?;

            let mut remote_file = sess.scp_send(&dest, 0o644, data.len() as u64, None)
                .map_err(|e| format!("创建远程文件失败 {}: {}", dest.display(), e))?;

            remote_file.write_all(&data)
                .map_err(|e| format!("写入远程文件失败 {}: {}", dest.display(), e))?;

            remote_file.send_eof().map_err(|e| format!("发送 EOF 失败: {}", e))?;
            remote_file.wait_eof().map_err(|e| format!("等待 EOF 失败: {}", e))?;
            remote_file.close().map_err(|e| format!("关闭远程文件失败: {}", e))?;
            remote_file.wait_close().map_err(|e| format!("等待关闭失败: {}", e))?;
        }

        Ok(())
    }).await.map_err(|e| format!("SSH 文件传输失败: {}", e))?
}

async fn clean_old_versions(
    project_id: String, instance_id: String, deploy_id: String, record_id: String, step_id: String,
    host: HostCore, target_dir: String, keep_versions: i64,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(), String> {
    if keep_versions == 0 { return Ok(()); }

    tokio::task::spawn_blocking(move || {
        let sess = ssh_connect(&host)?;

        let td = target_dir.trim_end_matches('/');
        let list_cmd = format!(
            "find {} -maxdepth 1 -type d -name '[0-9]*' 2>/dev/null | sort -t'/' -k{} -n -r | tail -n +{}",
            td, td.split('/').count(), keep_versions + 1
        );

        let mut channel = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
        channel.exec(&list_cmd).map_err(|e| format!("执行命令失败: {}", e))?;

        let mut output = String::new();
        channel.read_to_string(&mut output).map_err(|e| format!("读取输出失败: {}", e))?;
        channel.wait_close().map_err(|e| format!("等待命令完成失败: {}", e))?;

        let mut line_counter: i64 = 0;

        let log_cb = |lc: &mut i64, stream: &str, content: &str| -> Result<(), String> {
            *lc += 1;
            let pool = get_pool().map_err(|e| e.to_string())?;
            let rt = tokio::runtime::Handle::try_current().map_err(|e| e.to_string())?;
            let content = content.to_string();
            let stream = stream.to_string();
            let project_id = project_id.clone();
            let instance_id = instance_id.clone();
            let deploy_id = deploy_id.clone();
            let record_id = record_id.clone();
            let step_id = step_id.clone();

            rt.block_on(async {
                insert_log(&pool, &project_id, &instance_id, &deploy_id, &record_id, &step_id,
                           *lc, &stream, &content).await
            })
        };

        for line in output.lines() {
            let dir = line.trim().trim_end_matches('/');
            if dir.is_empty() { continue; }

            if cancel_flag.load(Ordering::Relaxed) {
                return Err("用户取消执行".to_string());
            }

            let rm_cmd = format!("rm -rf {}", dir);
            let log_msg = format!("删除旧版本: {}", dir);
            log_cb(&mut line_counter, "stdout", &log_msg)?;

            let mut ch = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
            ch.exec(&rm_cmd).map_err(|e| format!("执行命令失败: {}", e))?;
            ch.wait_close().map_err(|e| format!("等待命令完成失败: {}", e))?;
        }

        Ok(())
    }).await.map_err(|e| format!("清理旧版本失败: {}", e))?
}

async fn deploy_files_remote(
    project_id: String, instance_id: String, deploy_id: String, record_id: String, step_id: String,
    host: HostCore, version_dir: String, deploy_path: String,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        if cancel_flag.load(Ordering::Relaxed) {
            return Err("用户取消执行".to_string());
        }

        let sess = ssh_connect(&host)?;

        // Ensure deploy_path exists
        let mkdir_cmd = format!("mkdir -p {}", deploy_path.trim_end_matches('/'));
        let mut channel = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
        channel.exec(&mkdir_cmd).map_err(|e| format!("执行命令失败: {}", e))?;
        channel.wait_close().map_err(|e| format!("等待命令完成失败: {}", e))?;

        let mut line_counter: i64 = 0;

        let log_cb = |lc: &mut i64, stream: &str, content: &str| -> Result<(), String> {
            *lc += 1;
            let pool = get_pool().map_err(|e| e.to_string())?;
            let rt = tokio::runtime::Handle::try_current().map_err(|e| e.to_string())?;
            let content = content.to_string();
            let stream = stream.to_string();
            let project_id = project_id.clone();
            let instance_id = instance_id.clone();
            let deploy_id = deploy_id.clone();
            let record_id = record_id.clone();
            let step_id = step_id.clone();

            rt.block_on(async {
                insert_log(&pool, &project_id, &instance_id, &deploy_id, &record_id, &step_id,
                           *lc, &stream, &content).await
            })
        };

        // Copy files
        let src = format!("{}/*", version_dir.trim_end_matches('/'));
        let dest = format!("{}/", deploy_path.trim_end_matches('/'));
        let cmd = format!("cp -a {} {}", src, dest);

        let log_msg = format!("部署文件: {} -> {}", version_dir, deploy_path);
        log_cb(&mut line_counter, "stdout", &log_msg)?;

        let mut ch = sess.channel_session().map_err(|e| format!("创建 SSH 通道失败: {}", e))?;
        ch.exec(&cmd).map_err(|e| format!("执行部署命令失败: {}", e))?;
        ch.wait_close().map_err(|e| format!("等待命令完成失败: {}", e))?;
        let exit_status = ch.exit_status().map_err(|e| format!("获取退出码失败: {}", e))?;

        if exit_status != 0 {
            return Err(format!("部署失败, 退出码: {}", exit_status));
        }

        Ok(())
    }).await.map_err(|e| format!("部署失败: {}", e))?
}

// ============== Main deployment flow ==============

async fn run_deployment(
    record_id: String,
    script: DeployScriptView,
    host: HostCore,
    cancel_flag: Arc<AtomicBool>,
) -> Result<(), String> {
    let pool = get_pool()?;
    update_record_status(&pool, &record_id, "running", None, None).await?;

    let step_defs: Vec<(&str, &str, bool)> = vec![
        ("local_build", "本地构建", true),
        ("local_post", "本地推送", true),
        ("remote_pre", "远程部署前置脚本执行", false),
        ("remote_deploy", "远程部署", false),
        ("remote_post", "远程部署后置脚本执行", false),
    ];

    let is_local = script.script_type == "local";

    // Create 5 steps
    let mut step_ids: Vec<String> = Vec::new();
    let now = now_ms();
    for (st, sn, _) in &step_defs {
        let sid = generate_id();
        let status = if is_local && !st.starts_with("local") { "skipped" } else { "pending" };
        sqlx::query(
            "INSERT INTO deploy_step (id, project_id, instance_id, deploy_id, script_id, record_id,
                                      step_type, step_name, status, created_at, updated_at, started_at, finished_at, error)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, '', '', '')"
        )
        .bind(&sid).bind(&script.project_id).bind(&script.instance_id).bind("").bind(&script.id).bind(&record_id)
        .bind(st).bind(sn).bind(status).bind(now).bind(now)
        .execute(pool).await.map_err(|e| format!("插入步骤失败: {}", e))?;
        step_ids.push(sid);
    }

    // Step 1: Local Build
    let step1_id = &step_ids[0];
    let started = now_str();
    update_step_status(&pool, step1_id, "running", Some(&started), None, None).await?;

    match execute_local_commands(&pool, &script.project_id, &script.instance_id, "", &record_id, step1_id,
                                  &script.local_work_dir, &script.local_commands, &cancel_flag).await {
        Ok(_) => {
            let finished = now_str();
            update_step_status(&pool, step1_id, "success", Some(&started), Some(&finished), None).await?;
        }
        Err(e) => {
            let finished = now_str();
            update_step_status(&pool, step1_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
            fail_remaining_steps(&pool, &step_ids, 1, &e).await?;
            update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
            unregister_running_task(&record_id);
            return Err(e);
        }
    }

    // Step 2: Local Post (collect and copy files)
    let step2_id = &step_ids[1];
    let started = now_str();
    update_step_status(&pool, step2_id, "running", Some(&started), None, None).await?;

    let source_dir = Path::new(&script.build_output_dir);
    let files = collect_files(source_dir, &script.scan_depth, &script.match_mode, &script.match_rules);

    if files.is_empty() {
        let finished = now_str();
        let msg = "未找到符合条件的文件";
        let mut lc = 0; lc += 1;
        insert_log(&pool, &script.project_id, &script.instance_id, "", &record_id, step2_id, lc, "stdout", msg).await?;
        update_step_status(&pool, step2_id, "success", Some(&started), Some(&finished), None).await?;
    } else {
        if is_local {
            match copy_files_to_dir(&pool, &script.project_id, &script.instance_id, "", &record_id, step2_id,
                                    source_dir, &files, &script.target_dir, &cancel_flag).await {
                Ok(_) => {
                    let finished = now_str();
                    update_step_status(&pool, step2_id, "success", Some(&started), Some(&finished), None).await?;
                }
                Err(e) => {
                    let finished = now_str();
                    update_step_status(&pool, step2_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
                    fail_remaining_steps(&pool, &step_ids, 2, &e).await?;
                    update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
                    unregister_running_task(&record_id);
                    return Err(e);
                }
            }
            let finished = now_str();
            update_record_status(&pool, &record_id, "success", None, Some(&finished)).await?;
            unregister_running_task(&record_id);
            return Ok(());
        } else {
            let version_id = record_id.clone();
            let version_dir = format!("{}/{}", script.target_dir.trim_end_matches('/'), version_id);

            match copy_files_via_ssh(
                script.project_id.clone(), script.instance_id.clone(), "".to_string(), record_id.clone(), step2_id.clone(),
                host.clone(), source_dir.to_path_buf(), files.clone(), version_dir, cancel_flag.clone()
            ).await {
                Ok(_) => {
                    let finished = now_str();
                    update_step_status(&pool, step2_id, "success", Some(&started), Some(&finished), None).await?;
                }
                Err(e) => {
                    let finished = now_str();
                    update_step_status(&pool, step2_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
                    fail_remaining_steps(&pool, &step_ids, 2, &e).await?;
                    update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
                    unregister_running_task(&record_id);
                    return Err(e);
                }
            }
        }
    }

    // Step 3: Remote Pre-deploy commands
    let step3_id = &step_ids[2];
    let started = now_str();
    update_step_status(&pool, step3_id, "running", Some(&started), None, None).await?;

    if !script.pre_deploy_commands.is_empty() {
        match execute_remote_commands(
            script.project_id.clone(), script.instance_id.clone(), "".to_string(), record_id.clone(), step3_id.clone(),
            host.clone(), script.pre_deploy_commands.clone(), cancel_flag.clone()
        ).await {
            Ok(_) => {
                let finished = now_str();
                update_step_status(&pool, step3_id, "success", Some(&started), Some(&finished), None).await?;
            }
            Err(e) => {
                let finished = now_str();
                update_step_status(&pool, step3_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
                fail_remaining_steps(&pool, &step_ids, 3, &e).await?;
                update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
                unregister_running_task(&record_id);
                return Err(e);
            }
        }
    } else {
        let finished = now_str();
        update_step_status(&pool, step3_id, "success", Some(&started), Some(&finished), None).await?;
    }

    // Step 4: Remote Deploy
    let step4_id = &step_ids[3];
    let started = now_str();
    update_step_status(&pool, step4_id, "running", Some(&started), None, None).await?;

    let version_id = record_id.clone();
    let version_dir = format!("{}/{}", script.target_dir.trim_end_matches('/'), version_id);

    match deploy_files_remote(
        script.project_id.clone(), script.instance_id.clone(), "".to_string(), record_id.clone(), step4_id.clone(),
        host.clone(), version_dir.clone(), script.deploy_path.clone(), cancel_flag.clone()
    ).await {
        Ok(_) => {
            if let Err(e) = clean_old_versions(
                script.project_id.clone(), script.instance_id.clone(), "".to_string(), record_id.clone(), step4_id.clone(),
                host.clone(), script.target_dir.clone(), script.keep_versions, cancel_flag.clone()
            ).await {
                let mut lc = 0; lc += 1;
                insert_log(&pool, &script.project_id, &script.instance_id, "", &record_id, step4_id, lc, "stderr", &format!("清理旧版本警告: {}", e)).await?;
            }
            let finished = now_str();
            update_step_status(&pool, step4_id, "success", Some(&started), Some(&finished), None).await?;
        }
        Err(e) => {
            let finished = now_str();
            update_step_status(&pool, step4_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
            fail_remaining_steps(&pool, &step_ids, 4, &e).await?;
            update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
            unregister_running_task(&record_id);
            return Err(e);
        }
    }

    // Step 5: Remote Post-deploy commands
    let step5_id = &step_ids[4];
    let started = now_str();
    update_step_status(&pool, step5_id, "running", Some(&started), None, None).await?;

    if !script.post_deploy_commands.is_empty() {
        match execute_remote_commands(
            script.project_id.clone(), script.instance_id.clone(), "".to_string(), record_id.clone(), step5_id.clone(),
            host.clone(), script.post_deploy_commands.clone(), cancel_flag.clone()
        ).await {
            Ok(_) => {
                let finished = now_str();
                update_step_status(&pool, step5_id, "success", Some(&started), Some(&finished), None).await?;
            }
            Err(e) => {
                let finished = now_str();
                update_step_status(&pool, step5_id, "failed", Some(&started), Some(&finished), Some(&e)).await?;
                fail_remaining_steps(&pool, &step_ids, 5, &e).await?;
                update_record_status(&pool, &record_id, "failed", Some(&e), Some(&finished)).await?;
                unregister_running_task(&record_id);
                return Err(e);
            }
        }
    } else {
        let finished = now_str();
        update_step_status(&pool, step5_id, "success", Some(&started), Some(&finished), None).await?;
    }

    let finished = now_str();
    update_record_status(&pool, &record_id, "success", None, Some(&finished)).await?;
    unregister_running_task(&record_id);

    Ok(())
}

#[tauri::command]
pub async fn deploy_execute(
    script: DeployScriptView,
    host: HostCore,
) -> Result<String, String> {
    let pool = get_pool()?;
    let record_id = generate_id();
    let now = now_ms();
    let now_str_val = now_str();

    sqlx::query(
        "INSERT INTO deploy_record (id, created_at, updated_at, project_id, instance_id, deploy_id,
                                    script_id, status, error_summary, started_at, finished_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)"
    )
    .bind(&record_id).bind(now).bind(now)
    .bind(&script.project_id).bind(&script.instance_id).bind("")
    .bind(&script.id).bind("pending").bind("")
    .bind(&now_str_val).bind("")
    .execute(pool).await
    .map_err(|e| format!("插入部署记录失败: {}", e))?;

    let cancel_flag = Arc::new(AtomicBool::new(false));
    register_running_task(record_id.clone(), cancel_flag.clone());

    let record_id_for_spawn = record_id.clone();
    tokio::spawn(async move {
        if let Err(e) = run_deployment(record_id_for_spawn, script, host, cancel_flag).await {
            log::error!("Deployment failed: {}", e);
        }
    });

    Ok(record_id)
}

#[tauri::command]
pub async fn deploy_record_stop(record_id: String) -> Result<(), String> {
    let cancel_flag = {
        let tasks = crate::commands::deploy::db::running_tasks();
        let guard = tasks.lock().unwrap();

        guard.get(&record_id).cloned().ok_or("部署任务不存在或已结束".to_string())?
    };

    cancel_flag.store(true, Ordering::Relaxed);

    let pool = get_pool()?;
    let finished = now_str();
    update_record_status(pool, &record_id, "failed", Some("用户取消执行"), Some(&finished)).await?;

    Ok(())
}
