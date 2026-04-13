import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface DeployStep extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  script_id: string;
  record_id: string;

  step_type: 'local_build' | 'local_post' | 'remote_pre' | 'sftp_upload' | 'remote_post';
  step_name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at: string;
  finished_at: string;
  error: string;
}
