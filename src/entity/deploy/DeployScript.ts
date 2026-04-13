import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type DeployScriptScanDepth =
  | 'shallow'      // 当前目录
  | 'deep';        // 深度目录
export type DeployScriptMatchMode =
  | 'all'         // 全部
  | 'include'     // 包含
  | 'exclude';    // 排除
export type DeployScriptType =
  | 'remote'      // 远程
  | 'local';      // 本地

export interface DeployScriptCore {
  name: string;
  script_type: DeployScriptType;
  description: string;



  // ------------------------------ 本地 ------------------------------

  /**
   * 本地工作目录
   */
  local_work_dir: string;
  /**
   * 本地命令
   */
  local_commands: string;
  /**
   * 构建输出目录
   */
  build_output_dir: string;

  // ------------------------------ 过滤配置 ------------------------------

  /**
   * 扫描深度
   */
  scan_depth: DeployScriptScanDepth;

  /**
   * 匹配模式
   */
  match_mode: DeployScriptMatchMode;

  /**
   * 匹配规则
   */
  match_rules: string;

  // ------------------------------ 传输配置 ------------------------------

  /**
   * 目标主机 ID，为空代表本地
   */
  target_host_id: string;
  /**
   * 目标目录
   */
  target_dir: string;

  // ------------------------------ remote 有效 ------------------------------

  /**
   * 启用版本管理后的保留数量，0 代表无限制
   */
  keep_versions: number;

  /**
   * 部署目录
   */
  deploy_path: string;

  /**
   * 发行前执行
   */
  pre_deploy_commands: string;

  /**
   * 部署后执行
   */
  post_deploy_commands: string;
}

export interface DeployScript extends BaseEntity, DeployScriptCore {
  project_id: string;
  instance_id: string;
  version_id: string;
}

export interface DeployScriptList extends BaseEntity {
  name: string;
  script_type: DeployScriptType;
  description: string;
  local_work_dir: string;
  target_dir: string;
}

export interface DeployScriptForm extends Omit<DeployScriptCore, 'match_rules'> {
  match_rules: Array<string>
}

export interface DeployScriptView extends BaseEntity, DeployScriptForm {
  project_id: string;
  instance_id: string;
  version_id: string;
}
