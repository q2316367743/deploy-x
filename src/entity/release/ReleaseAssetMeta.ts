import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type ReleaseAssetMetaScope = 'version' | 'instance';
export type ReleaseAssetMetaFileType = 'document' | 'sql' | 'other';

export interface ReleaseAssetMetaCore {

  /**
   * 文件所在目录，如果为空则代表是根目录
   * @example sql/init.sql
   */
  relative_path: string;

  /**
   * 文件名
   */
  file_name: string;

  /**
   * 文件类型
   *
   * - document: markdown 文档
   * - sql: sql 文件
   * - other: 其他文件
   */
  file_type: ReleaseAssetMetaFileType;

}

export interface ReleaseAssetMeta extends BaseEntity, ReleaseAssetMetaCore {

  /**
   * 所属项目
   */
  project_id: string;

  /**
   * 作用域
   */
  scope: ReleaseAssetMetaScope;

  /**
   * 作用域ID
   */
  scope_id: string;

}