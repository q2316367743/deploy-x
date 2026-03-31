import {useSql} from "@/lib/sql.ts";
import type {ReleaseDeploy, ReleaseDeployCore, ReleaseInstance} from "@/entity";
import dayjs from "dayjs";

export async function addReleaseDeployService(prop: ReleaseDeployCore) {
  await useSql().mapper<ReleaseDeploy>('release_deploy').insert({
    ...prop,
    deploy_time: dayjs(version.publish_time).toDate().getTime(),
    created_at: Date.now(),
    updated_at: Date.now(),
  });
  // 修改当前版本
  await useSql().mapper<ReleaseInstance>('release_instance')
    .updateById(prop.instance_id, {
      current_version_id: prop.version_id
    })
}

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

export interface ReleaseDeployInstanceVersion extends ReleaseInstance {

  /**
   * 部署时间
   */
  deploy_time: number;

  /**
   * 部署用户
   */
  deploy_user: string;

}

/**
 * 获取指定版本的部署实例列表
 * @param projectId
 * @param versionId
 */
export async function listReleaseDeployByVersionId(projectId: string, versionId: string) {
  return useSql().select<Array<ReleaseDeployInstanceVersion>>(`
      select ri.*, rd.deploy_time, rd.deploy_user
      from release_deploy rd
               left join release_instance ri on rd.instance_id = ri.id
      where rd.project_id = '${projectId}'
        and rd.version_id = '${versionId}'`);
}
