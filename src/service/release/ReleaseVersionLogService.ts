import {useSql} from "@/lib/sql.ts";
import {
  type ReleaseVersion,
  type ReleaseVersionLog,
  type ReleaseVersionLogView,
  versionLogBaseToView,
  type VersionLogContent
} from "@/entity";

export interface ReleaseVersionWithLog extends ReleaseVersion {
  content: Array<VersionLogContent>;
}

interface ReleaseVersionWithLogBase extends ReleaseVersion {
  content: string;
}

export async function listReleaseVersionLog(ids: Array<string>): Promise<Array<ReleaseVersionWithLog>> {
  const list = await useSql().select<Array<ReleaseVersionWithLogBase>>(`
      select rv.*, rvl.content
      from release_version rv
               left join release_version_log rvl on rv.id = rvl.id
      where rv.id in ('${ids.join("','")}')
  `)
  return list.map(e => ({...e, content: JSON.parse(e.content)}));
}

export async function getReleaseVersionLog(id: string): Promise<ReleaseVersionLogView> {
  const one = await useSql().query<ReleaseVersionLog>('release_version_log').eq('id', id).get();
  return versionLogBaseToView(one!);
}

export function saveReleaseVersionLog(id: string, content: Array<VersionLogContent>) {
  return useSql().mapper<ReleaseVersionLog>('release_version_log').updateById(id, {
    content: JSON.stringify(content),
  });
}