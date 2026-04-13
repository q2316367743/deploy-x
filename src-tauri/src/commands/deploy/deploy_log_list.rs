use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::commands::deploy::db::get_pool;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DeployLog {
    pub id: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub project_id: String,
    pub instance_id: String,
    pub deploy_id: String,
    pub record_id: String,
    pub step_id: String,
    pub line_num: i64,
    pub stream: String,
    pub content: String,
}

#[tauri::command]
pub async fn deploy_log_list(step_id: String) -> Result<Vec<DeployLog>, String> {
    let pool = get_pool()?;

    let records: Vec<DeployLog> = sqlx::query_as(
        "SELECT id, created_at, updated_at, project_id, instance_id, deploy_id, record_id, step_id,
                line_num, stream, content
         FROM deploy_log
         WHERE step_id = ?1
         ORDER BY line_num ASC"
    )
    .bind(&step_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("查询日志列表失败: {}", e))?;

    Ok(records)
}
