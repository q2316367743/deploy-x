import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseInstanceCore {

  /**
   * 名称
   */
  name: string;

  /**
   * 描述
   */
  desc: string;

}

/**
 * 部署实例
 */
export interface ReleaseInstance extends BaseEntity, ReleaseInstanceCore {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 当前版本
   */
  current_version_id: string;

}