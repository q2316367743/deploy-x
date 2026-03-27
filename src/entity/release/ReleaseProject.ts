import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseProjectCore {
  /**
   * 项目名称
   */
  name: string;
  /**
   * 项目描述
   */
  desc: string;

}

/**
 * 发版项目
 */
export interface ReleaseProject extends BaseEntity, ReleaseProjectCore {
}