import type {BaseEntity} from "@/entity/BaseEntity.ts";

export type HostCredentialType = 'password' | 'secret';

export interface HostCredentialCore {
  name: string;
  type: HostCredentialType;
  username: string;
  password: string;
  // type=secret 时有效
  secret: string;
}

export interface HostCredential extends BaseEntity, HostCredentialCore {
}

export function buildHostCredentialCore(): HostCredentialCore {
  return {
    name: '',
    type: 'password',
    username: '',
    password: '',
    secret: '',
  }
}