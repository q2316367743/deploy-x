import {compressTo} from "@/lib/invoke.ts";
import {revealItemInDir} from "@tauri-apps/plugin-opener";
import type {ReleaseAssetListItem} from "@/pages/project/components/asset/types.ts";
import {save} from "@tauri-apps/plugin-dialog";

export async function compressList(filename: string, items: Array<ReleaseAssetListItem>) {
  if (!items || !items.length) {
    return Promise.reject(Error("附件列表为空"));
  }
  // 获取保存目录
  const path = await save({
    title: '选择压缩包保存位置',
    defaultPath: `${filename}.zip`,
  });
  if (!path) return Promise.reject(Error("取消保存位置选择"));
  await compressTo(path, items.map(item => ({
    source: item.path,
    target: '/' + item.filename
  })));
  await revealItemInDir(path);
}

/**
 * 打包多版本
 */
export async function compressVersions(filename: string, versions: Array<{
  version: string,
  items: Array<ReleaseAssetListItem>
}>) {

  const list = versions.flatMap(version => version.items.map(item => ({
    source: item.path,
    target: `/${version.version}/${item.filename}`
  })));

  if (!list || !list.length) {
    return Promise.reject(Error("附件列表为空"));
  }
  // 获取保存目录
  const path = await save({
    title: '选择压缩包保存位置',
    defaultPath: `${filename}.zip`,
  });
  if (!path) return Promise.reject(Error("取消保存位置选择"));
  await compressTo(path, list);
  await revealItemInDir(path);

}