import {useSql} from "@/lib/sql.ts";
import type {Host, HostCore} from "@/entity";

export function listHost(name?: string) {
  return useSql().query<Host>('host')
    .like("name", name)
    .list();
}

export function addHost(form: HostCore) {
  const now = Date.now();
  return useSql().mapper<Host>('host')
    .insert({
      ...form,
      created_at: now,
      updated_at: now,
    });
}

export function updateHost(id: string, form: Partial<HostCore>) {
  const now = Date.now();
  return useSql().mapper<Host>('host')
    .updateById(id, {
      ...form,
      updated_at: now,
    });
}

export function removeHost(id: string) {
  return useSql().mapper<Host>('host').deleteById(id);
}
