import {useSql} from "@/lib/sql.ts";
import type {HostCredential, HostCredentialCore} from "@/entity";

export function listHostCredential(name?: string) {
  return useSql().query<HostCredential>('host_credential')
    .like("name", name)
    .list();
}

export function addHostCredential(form: HostCredentialCore) {
  const now = Date.now();
  return useSql().mapper<HostCredential>('host_credential')
    .insert({
      ...form,
      created_at: now,
      updated_at: now,
    });
}

export function updateHostCredential(id: string, form: Partial<HostCredentialCore>) {
  const now = Date.now();
  return useSql().mapper<HostCredential>('host_credential')
    .updateById(id, {
      ...form,
      updated_at: now,
    });
}

export function removeHostCredential(id: string) {
  return useSql().mapper<HostCredential>('host_credential').deleteById(id);
}