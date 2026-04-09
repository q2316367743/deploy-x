import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface DeployStep extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  record_id: string;

  step_type: string;
  step_name: string;
  status: string;
  started_at: string;
  finished_at: string;
  error: string;
}
