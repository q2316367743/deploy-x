import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseCredentialItemCore {
  key: string;
  value: string;
  // text/password
  value_type: "text" | "number" | "url" | "tel" | "password";
  desc: string;
}

export interface ReleaseCredentialItem extends BaseEntity, ReleaseCredentialItemCore {
  project_id: string;
  instance_id: string;
  group_id: string;
}