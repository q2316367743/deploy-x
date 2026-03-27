import {useSql} from "@/lib/sql.ts";
import type {ReleaseInstance, ReleaseInstanceCore} from "@/entity";

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

