import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface DeployLog extends BaseEntity {
  project_id: string;
  instance_id: string;
  deploy_id: string;
  record_id: string;
  step_id: string;

  line_num: number;
  stream: string;
  content: string;
}
