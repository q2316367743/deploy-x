import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type DeployRecordStatus =
  | 'pending'     // 等待中
  | 'running'     // 执行中
  | 'success'     // 执行成功
  | 'failed';     // 执行失败

export const DeployRecordStatusMap = {
  pending: '带执行',
  running: '执行中',
  success: '执行成功',
  failed: '执行失败',
}

export interface DeployRecord extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  script_id: string;

  status: DeployRecordStatus;
  error_summary: string;
  started_at: string;
  finished_at: string;
}
