import {useSql} from "@/lib/sql.ts";
import type {ReleaseDeploy, ReleaseDeployCore} from "@/entity";

/**
 * 获取发版列表
 * @param projectId 项目 ID
 */
export async function listReleaseDeployService(projectId: string) {
  return useSql().query<ReleaseDeploy>('release_deploy').eq('project_id', projectId).list();
}


export async function addReleaseDeployService(prop: ReleaseDeployCore) {
  await useSql().mapper<ReleaseDeploy>('release_deploy').insert({
    ...prop,
    created_at: Date.now(),
    updated_at: Date.now(),
  })
}