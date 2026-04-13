use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::commands::deploy::db::get_pool;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DeployRecord {
    pub id: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub project_id: String,
    pub instance_id: String,
    pub deploy_id: String,
    pub script_id: String,
    pub status: String,
    pub error_summary: String,
    pub started_at: String,
    pub finished_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PageResponse<T> {
    pub total: i64,
    pub records: Vec<T>,
    pub page_num: i64,
    pub page_size: i64,
}

#[tauri::command]
pub async fn deploy_record_page(
    page_num: i64,
    page_size: i64,
    script_id: String,
) -> Result<PageResponse<DeployRecord>, String> {
    let pool = get_pool()?;

    let offset = (page_num - 1) * page_size;

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deploy_record WHERE script_id = ?1"
    )
    .bind(&script_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("查询总数失败: {}", e))?;

    let records: Vec<DeployRecord> = sqlx::query_as(
        "SELECT id, created_at, updated_at, project_id, instance_id, deploy_id, script_id, status, error_summary, started_at, finished_at
         FROM deploy_record
         WHERE script_id = ?1
         ORDER BY created_at DESC
         LIMIT ?2 OFFSET ?3"
    )
    .bind(&script_id)
    .bind(page_size)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("查询记录失败: {}", e))?;

    Ok(PageResponse {
        total: total.0,
        records,
        page_num,
        page_size,
    })
}
