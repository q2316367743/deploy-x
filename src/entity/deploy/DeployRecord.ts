import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface DeployRecord extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  script_id: string;

  status: string;
  error_summary: string;
  started_at: string;
  finished_at: string;
}
