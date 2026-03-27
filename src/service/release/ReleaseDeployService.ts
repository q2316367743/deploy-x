import {useSql} from "@/lib/sql.ts";
import type {ReleaseDeploy, ReleaseDeployCore} from "@/entity";

/**
 * 获取发版列表
 * @param projectId 项目 ID
 * @param versionIds 版本 ID 列表
 */
export async function listReleaseDeployService(projectId: string, versionIds: string[]) {
  if (versionIds.length === 0) return [];
  return useSql().query<ReleaseDeploy>('release_deploy')
    .eq('project_id', projectId)
    .in('version_id', versionIds)
    .list();
}

export function countReleaseDeploy(projectId: string) {
  return useSql().query<ReleaseDeploy>('release_deploy')
    .eq('project_id', projectId)
    .count();
}


export async function addReleaseDeployService(prop: ReleaseDeployCore) {
  await useSql().mapper<ReleaseDeploy>('release_deploy').insert({
    ...prop,
    created_at: Date.now(),
    updated_at: Date.now(),
  })
}