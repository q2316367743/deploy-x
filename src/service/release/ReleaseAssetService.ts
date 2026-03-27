import type {
  ReleaseAssetMeta,
  ReleaseAssetMetaCore,
  ReleaseAssetMetaScope,
  ReleaseAssetContent,
  ReleaseAssetContentCore
} from "@/entity";
import {useSql} from "@/lib/sql.ts";

/**
 * 获取附件列表
 * @param projectId 项目 ID
 * @param scope 作用域
 * @param scopeId 作用域 ID
 */
export async function listReleaseAssetMeta(projectId: string, scope: ReleaseAssetMetaScope, scopeId: string) {
  return useSql().query<ReleaseAssetMeta>('release_asset_meta')
    .eq('project_id', projectId)
    .eq('scope', scope)
    .eq('scope_id', scopeId)
    .list()
}

/**
 * 获取附件列表
 * @param projectId 项目 ID
 * @param scope 作用域
 * @param scopeIds 作用域 IDs
 */
export async function listReleaseAssetMetas(projectId: string, scope: ReleaseAssetMetaScope, scopeIds: Array<string>) {
  return useSql().query<ReleaseAssetMeta>('release_asset_meta')
    .eq('project_id', projectId)
    .eq('scope', scope)
    .in('scope_id', scopeIds)
    .list()
}


/**
 * 添加附件
 * @param projectId 项目 ID
 * @param scope 作用域
 * @param scopeId 作用域 ID
 * @param meta 元数据
 */
export async function addReleaseAsset(projectId: string, scope: ReleaseAssetMetaScope, scopeId: string, meta: ReleaseAssetMetaCore) {
  const now = Date.now();
  const {id} = await useSql().mapper<ReleaseAssetMeta>('release_asset_meta').insert({
    project_id: projectId,
    scope: scope,
    scope_id: scopeId,
    created_at: now,
    updated_at: now,
    ...meta
  });
  try {
    await useSql().mapper<ReleaseAssetContent>('release_asset_content').insertSelf({
      id,
      created_at: now,
      updated_at: now,
      content: '',
      project_id: projectId,
      language: meta.file_type === 'sql' ? 'sql' : (meta.file_type === 'document' ? 'markdown' : 'plaintext')
    })
  } catch (e) {
    // 删除
    await deleteReleaseAsset(id);
    throw e
  }
}

/**
 * 更新附件
 * @param id 附件 ID
 * @param meta 元数据
 */
export async function updateReleaseAsset(id: string, meta: ReleaseAssetMetaCore) {
  const now = Date.now();
  await useSql().mapper<ReleaseAssetMeta>('release_asset_meta').updateById(id, {
    updated_at: now,
    ...meta
  });
}

/**
 * 保存附件内容
 * @param id 附件 ID
 * @param content 内容
 */
export async function saveReleaseAsset(id: string, content: ReleaseAssetContentCore) {
  await useSql().mapper<ReleaseAssetContent>('release_asset_content').updateById(id, {
    updated_at: Date.now(),
    ...content
  });
}

/**
 * 获取附件内容
 * @param id 附件 ID
 */
export async function getReleaseAssetContent(id: string) {
  return useSql().query<ReleaseAssetContent>('release_asset_content')
    .eq('id', id)
    .first()
}

/**
 * 删除附件
 * @param id 附件 ID
 */
export async function deleteReleaseAsset(id: string) {
  await useSql().mapper<ReleaseAssetMeta>('release_asset_meta').deleteById(id);
  await useSql().mapper<ReleaseAssetContent>('release_asset_content').deleteById(id);
}