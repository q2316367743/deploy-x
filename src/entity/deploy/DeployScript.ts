import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface DeployScript extends BaseEntity {
  project_id: string;
  instance_id: string;

  name: string;
  script_type: 'remote' | 'local';
  description: string;

  local_commands: string;
  build_output_dir: string;
  file_filter_type: string;
  file_filter_rules: string;

  target_host_id: string;
  target_dir: string;
  versioning_enabled: boolean;
  keep_versions: number;

  pre_deploy_commands: string;
  switch_enabled: boolean;
  switch_target_dir: string;
  post_deploy_commands: string;
}


export interface DeployScriptView extends BaseEntity {
  project_id: string;
  instance_id: string;

  name: string;
  script_type: 'remote' | 'local';
  description: string;

  local_commands: string[];
  build_output_dir: string;
  file_filter_type: string;
  file_filter_rules: string[];

  target_host_id: string;
  target_dir: string;
  versioning_enabled: boolean;
  keep_versions: number;

  pre_deploy_commands: string[];
  switch_enabled: boolean;
  switch_target_dir: string;
  post_deploy_commands: string[];
}

