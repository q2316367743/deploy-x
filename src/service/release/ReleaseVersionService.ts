import type {ReleaseVersion, ReleaseVersionCore, ReleaseVersionLog} from "@/entity";
import {useSql} from "@/lib/sql.ts";
import dayjs from "dayjs";
import {mkdir} from "@tauri-apps/plugin-fs";
import {joinPath} from "@/util/lang/FileUtil.ts";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";

export async function addReleaseVersionService(projectId: string, version: Partial<ReleaseVersionCore>) {
  const {id} = await useSql().mapper<ReleaseVersion>('release_version').insert({
    ...version,
    project_id: projectId,
    publish_time: dayjs(version.publish_time).toDate().getTime(),
    created_at: Date.now(),
    updated_at: Date.now()
  });
  await useSql().mapper<ReleaseVersionLog>('release_version_log').insertSelf({
    project_id: projectId,
    id,
    content: '[]',
  });
  // 创建目录
  await mkdir(joinPath(APP_DATA_ASSET_DIR(), 'version', id));
}

export async function listReleaseVersionService(projectId: string, limit?: number) {
  const query = useSql().query<ReleaseVersion>('release_version')
    .eq('project_id', projectId)
    .orderByDesc('publish_time');
  if (limit) {
    query.lastSql(`limit ${limit}`);
  }
  return query.list();
}

export function countReleaseVersion(projectId: string) {
  return useSql().query<ReleaseVersion>('release_version')
    .eq('project_id', projectId)
    .count();
}

export async function getReleaseVersionService(id: string, projectId: string) {
  return useSql().query<ReleaseVersion>('release_version').eq('id', id).eq('project_id', projectId).get();
}

export async function updateReleaseVersionService(id: string, version: Partial<ReleaseVersionCore>) {
  return useSql().mapper<ReleaseVersion>('release_version').updateById(id, {
    version: version.version,
    publish_time: version.publish_time,
    publish_user: version.publish_user,
    updated_at: Date.now()
  });
}

export async function deleteReleaseVersionService(id: string) {
  return useSql().mapper<ReleaseVersion>('release_version').deleteById(id);
}

interface ReleaseVersionDeployProp {
  projectId: string;
  deployTimeStart: number;
  deployTimeEnd: number;

}

export async function listReleaseVersionDeploy(props: ReleaseVersionDeployProp) {
  return useSql().query<ReleaseVersion>('release_version')
    .eq('project_id', props.projectId)
    .ge('publish_time', props.deployTimeStart)
    .le('publish_time', props.deployTimeEnd)
    .orderByAsc('publish_time')
    .list();
}

export interface ReleaseVersionDeploy extends ReleaseVersion {
  deploy_time: number;
  deploy_user: string
}

export function listReleaseVersionByInstanceId(instanceId: string, projectId: string) {
  return useSql().select<Array<ReleaseVersionDeploy>>(`
      select rv.*, rd.deploy_time, rd.deploy_user
      from release_deploy rd
               left join release_version rv on rd.version_id = rv.id
      where rd.instance_id = '${instanceId}'
        and rd.project_id = '${projectId}'
      order by rv.publish_time desc
  `);
}