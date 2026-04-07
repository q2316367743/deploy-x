import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface ReleaseCredentialGroupCore {
  name: string;
  desc: string;
}

export interface ReleaseCredentialGroup extends BaseEntity, ReleaseCredentialGroupCore {
  project_id: string;
  instance_id: string;
}