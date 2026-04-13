import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type DeployStepType =
  | 'local_build'     // 本地构建
  | 'local_post'      // 本地推送
  | 'remote_pre'      // 远程部署前置脚本执行
  | 'remote_deploy'   // 远程部署
  | 'remote_post';    // 远程部署后置脚本执行

export type DeployStepStatus =
  | 'pending'     // 等待中
  | 'running'     // 执行中
  | 'success'     // 执行成功
  | 'failed'      // 执行失败
  | 'skipped'     // 跳过执行

export interface DeployStep extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  script_id: string;
  record_id: string;

  step_type: DeployStepType;
  step_name: string;
  status: DeployStepStatus;
  started_at: string;
  finished_at: string;
  error: string;
}
