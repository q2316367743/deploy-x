import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface HostCore {
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

export interface Host extends BaseEntity, HostCore {
}

export function buildHostCore(): HostCore {
  return {
    name: '',
    host: '',
    port: 22,
    auth_type: 'password',
    auth_user: '',
    auth_password: '',
    auth_secret: '',
    credential_id: '',
    remark: '',
  }
}