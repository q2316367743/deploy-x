import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseDeployBase {
  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 发版版本
   */
  version_id: string;

  /**
   * 发版实例
   */
  instance_id: string;
}

export interface ReleaseDeployCore extends ReleaseDeployBase{

  /**
   * 部署时间
   */
  deploy_time: number;

  /**
   * 部署用户
   */
  deploy_user: string;
}

export interface ReleaseDeploy extends BaseEntity, ReleaseDeployCore {
}