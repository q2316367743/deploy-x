import {useSql} from "@/lib/sql.ts";
import type {
  ReleaseProject,
  ReleaseProjectCore,
  ReleaseVersion,
  ReleaseInstance,
  ReleaseDeploy,
  ReleaseVersionLog,
  ReleaseAssetContent,
  ReleaseAssetMeta
} from "@/entity";

export async function listReleaseProject() {
  const query = useSql().query<ReleaseProject>('release_project');
  return query.list();
}

export async function getReleaseProject(id: string) {
  return useSql().query<ReleaseProject>('release_project').eq('id', id).get();
}

export async function addReleaseProject(project: ReleaseProjectCore) {
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  return mapper.insert({
    ...project,
    created_at: Date.now(),
    updated_at: Date.now()
  });
}

export async function updateReleaseProject(id: string, project: Partial<ReleaseProject>) {
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  return mapper.updateById(id, {
    name: project.name,
    desc: project.desc,
    updated_at: Date.now()
  });
}

export async function deleteReleaseProject(id: string) {
  await useSql().beginTransaction(async sql => {
    const mapper = sql.mapper<ReleaseProject>('release_project');
    // 删除基础信息
    await mapper.deleteById(id);
    await sql.query<ReleaseVersion>('release_version').eq('project_id', id).delete();
    await sql.query<ReleaseInstance>('release_instance').eq('project_id', id).delete();
    await sql.query<ReleaseDeploy>('release_deploy').eq('project_id', id).delete();
    await sql.query<ReleaseVersionLog>('release_version_log').eq('project_id', id).delete();
    await sql.query<ReleaseAssetContent>('release_asset_content').eq('project_id', id).delete();
    await sql.query<ReleaseAssetMeta>('release_asset_meta').eq('project_id', id).delete();
  })
}