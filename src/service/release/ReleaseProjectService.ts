import {useSql} from "@/lib/sql.ts";
import type {
  ReleaseAssetContent,
  ReleaseAssetMeta,
  ReleaseDeploy,
  ReleaseInstance,
  ReleaseProject,
  ReleaseProjectCore,
  ReleaseVersion,
  ReleaseVersionLog
} from "@/entity";
import {BaseDirectory, mkdir, remove} from "@tauri-apps/plugin-fs";
import {joinPath} from "@/util/lang/FileUtil.ts";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";

export async function listReleaseProject() {
  const query = useSql().query<ReleaseProject>('release_project');
  return query.list();
}

export async function getReleaseProject(id: string) {
  return useSql().query<ReleaseProject>('release_project').eq('id', id).get();
}

export async function addReleaseProject(project: ReleaseProjectCore) {
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  const {id} = await mapper.insert({
    ...project,
    created_at: Date.now(),
    updated_at: Date.now()
  });
  // 创建相关目录
  await mkdir(joinPath(APP_DATA_ASSET_DIR(), id, "version"), {recursive: true})
  await mkdir(joinPath(APP_DATA_ASSET_DIR(), id, "instance"), {recursive: true})
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
  const mapper = useSql().mapper<ReleaseProject>('release_project');
  // 删除基础信息
  await mapper.deleteById(id);
  await useSql().query<ReleaseVersion>('release_version').eq('project_id', id).delete();
  await useSql().query<ReleaseInstance>('release_instance').eq('project_id', id).delete();
  await useSql().query<ReleaseDeploy>('release_deploy').eq('project_id', id).delete();
  await useSql().query<ReleaseVersionLog>('release_version_log').eq('project_id', id).delete();
  await useSql().query<ReleaseAssetContent>('release_asset_content').eq('project_id', id).delete();
  await useSql().query<ReleaseAssetMeta>('release_asset_meta').eq('project_id', id).delete();
  // 删除附件
  const folder = joinPath(APP_DATA_ASSET_DIR(), id);
  await remove(folder, {recursive: true, baseDir: BaseDirectory.AppData});
}