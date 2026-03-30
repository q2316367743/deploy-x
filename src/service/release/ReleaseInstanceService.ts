import {useSql} from "@/lib/sql.ts";
import type {ReleaseInstance, ReleaseInstanceCore} from "@/entity";

export async function addReleaseInstanceService(projectId: string, instance: Partial<ReleaseInstanceCore>) {
  return useSql().mapper<ReleaseInstance>('release_instance').insert({
    ...instance,
    current_version_id: '',
    project_id: projectId,
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

export async function updateReleaseInstanceService(id: string, instance: Partial<ReleaseInstanceCore & {
  current_version_id: string
}>) {
  return useSql().mapper<ReleaseInstance>('release_instance').updateById(id, {
    name: instance.name,
    desc: instance.desc,
    current_version_id: instance.current_version_id,
    updated_at: Date.now()
  });
}

export async function deleteReleaseInstanceService(id: string) {
  return useSql().mapper<ReleaseInstance>('release_instance').deleteById(id);
}


export async function listReleaseInstanceService(projectId: string) {
  return useSql().query<ReleaseInstance>('release_instance').eq('project_id', projectId).list();
}

export async function countReleaseInstance(projectId: string) {
  return useSql().query<ReleaseInstance>('release_instance')
    .eq('project_id', projectId).count();
}

export async function getReleaseInstanceService(id: string, projectId: string) {
  return useSql().query<ReleaseInstance>('release_instance').eq('id', id).eq('project_id', projectId).one();
}

export interface ReleaseInstanceVersion {
  instance_id: string;
  instance_name: string;
  instance_desc: string;
  version_id?: string;
  version_name?: string;
  publish_time?: number;
  publish_user?: string;
}

export async function groupReleaseInstanceVersion(projectId: string) {
  return useSql().select<Array<ReleaseInstanceVersion>>(`
      SELECT ri.id       AS instance_id,
             ri.name     AS instance_name,
             ri.\`desc\` AS instance_desc,
             rv.id       AS version_id,
             rv.version  AS version_name,
             rv.publish_time,
             rv.publish_user
      FROM release_instance ri
               LEFT JOIN (SELECT rd.instance_id,
                                 rv.id,
                                 rv.version,
                                 rv.publish_time,
                                 rv.publish_user,
                                 -- 按照 instance_id 分组，并根据 publish_time 降序排名
                                 ROW_NUMBER() OVER (
                                     PARTITION BY rd.instance_id
                                     ORDER BY rv.publish_time DESC
                                     ) AS rn
                          FROM release_deploy rd
                                   INNER JOIN
                               release_version rv ON rd.version_id = rv.id) rv ON rv.instance_id = ri.id AND rv.rn = 1
      where ri.project_id = ${projectId}

  `);
}

