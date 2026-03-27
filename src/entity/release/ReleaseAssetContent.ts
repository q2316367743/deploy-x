import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseAssetContentCore {

  /**
   * 当是其他时有效
   */
  language: string;

  /**
   * 内容
   */
  content: string;

}

export interface ReleaseAssetContent extends BaseEntity, ReleaseAssetContentCore {

  /**
   * 所属项目
   */
  project_id: string;

}