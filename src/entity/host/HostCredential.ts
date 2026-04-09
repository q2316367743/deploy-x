import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface HostCredential extends BaseEntity {
  type: 'password' | 'secret';
  username: string;
  password: string;
  secret: string;
}