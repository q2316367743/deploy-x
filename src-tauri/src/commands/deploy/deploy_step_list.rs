use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::commands::deploy::db::get_pool;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DeployStep {
    pub id: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub project_id: String,
    pub instance_id: String,
    pub deploy_id: String,
    pub script_id: String,
    pub record_id: String,
    pub step_type: String,
    pub step_name: String,
    pub status: String,
    pub started_at: String,
    pub finished_at: String,
    pub error: String,
}

#[tauri::command]
pub async fn deploy_step_list(record_id: String) -> Result<Vec<DeployStep>, String> {
    let pool = get_pool()?;

    let records: Vec<DeployStep> = sqlx::query_as(
        "SELECT id, created_at, updated_at, project_id, instance_id, deploy_id, script_id, record_id,
                step_type, step_name, status, started_at, finished_at, error
         FROM deploy_step
         WHERE record_id = ?1
         ORDER BY created_at ASC"
    )
    .bind(&record_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("查询步骤列表失败: {}", e))?;

    Ok(records)
}
