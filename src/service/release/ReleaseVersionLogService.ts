import {useSql} from "@/lib/sql.ts";
import type {ReleaseVersionLog} from "@/entity";

export function listReleaseVersionLog(ids: Array<string>) {
  return useSql().query<ReleaseVersionLog>('release_version_log')
    .in('id', ids)
    .list();
}

export async function getReleaseVersionLog(id: string): Promise<ReleaseVersionLog> {
  const one = await useSql().query<ReleaseVersionLog>('release_version_log').eq('id', id).one();
  return one!;
}

export function saveReleaseVersionLog(id: string, content: string) {
  return useSql().mapper<ReleaseVersionLog>('release_version_log').updateById(id, {content});
}