import type {BaseEntity} from "@/entity/BaseEntity.ts";

export interface HostCore {
  name: string;
  host: string;
  port: number;
  auth_type: 'password' | 'secret' | 'credential';
  // 用户名
  auth_user: string;
  // 密码，如果认证类型是密钥，那么这个就是密钥的密码
  auth_password: string;
  // 密钥
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