import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface Host extends BaseEntity {
  name: string;
  host: string;
  port: number;
  auth_type: 'password' | 'secret' | 'credential';
  auth_user: string;
  auth_password: string;
  auth_secret: string;
  credential_id: string;
  remark: string
}