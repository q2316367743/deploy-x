import {BaseDirectory, copyFile, readDir, readTextFile, remove, rename, writeTextFile} from "@tauri-apps/plugin-fs";
import {open} from '@tauri-apps/plugin-dialog';
import {basename, joinPath} from "@/util/lang/FileUtil.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";
import {
  type ReleaseAssetListItem,
  type ReleaseAssetListItemType,
  ReleaseAssetListItemTypeLabel,
  type ReleaseAssetScope
} from "@/pages/project/components/asset/types.ts";

interface ParseAssetFilenameResult {
  name: string,
  type: ReleaseAssetListItemType
}

function parseAssetFilename(filename: string): ParseAssetFilenameResult {
  const typeIndex = filename.indexOf("|");
  const typeStr = filename.substring(0, typeIndex);
  const name = filename.substring(typeIndex + 1);
  const type = typeStr === '1' ? 1 : typeStr === '2' ? 2 : 3;
  console.log(filename, name, type)
  return {name: name, type: type};
}

// 加载附件列表
export const loadAssetList = async (projectId: string, scope: ReleaseAssetScope, scopeId: string) => {
  const items = new Array<ReleaseAssetListItem>();
  // 获取路径
  const folder = joinPath(APP_DATA_ASSET_DIR(), projectId, scope, scopeId);
  const list = await readDir(folder, {baseDir: BaseDirectory.AppData});
  for (const item of list) {
    if (!item.isFile) continue;
    const path = joinPath(folder, item.name);

    const {name, type} = parseAssetFilename(item.name);

    items.push({
      filename: name,
      path: path,
      folder: folder,
      file_type: type,
    });
  }
  return items;
};

// 创建附件
export const createAssetItem = async (projectId: string, scope: ReleaseAssetScope, scopeId: string, type: ReleaseAssetListItemType, onUpdate: () => void) => {
  MessageBoxUtil.prompt("请输入文件名", `新增${ReleaseAssetListItemTypeLabel[type]}文件`)
    .then(name => {
      const path = joinPath(APP_DATA_ASSET_DIR(), projectId, scope, scopeId, `${type}|${name}`);
      writeTextFile(path, '', {baseDir: BaseDirectory.AppData})
        .then(() => {
          onUpdate();
          MessageUtil.success('新增文件成功');
        })
        .catch(e => {
          MessageUtil.error('新增文件失败', e);
        });
    })
}

// 上传附件项
export const uploadAssetItem = async (projectId: string, scope: ReleaseAssetScope, scopeId: string) => {
  // 选择文件
  const source = await open({
    title: "请选择要上传的附件",
    directory: false,
    multiple: false,
  });
  if (!source) return Promise.reject();
  // 获取文件名
  const sourceBasename = basename(source);
  // 构建目标文件路径
  const target = joinPath(APP_DATA_ASSET_DIR(), projectId, scope, scopeId, `3|${sourceBasename}`);
  // 复制文件
  await copyFile(source, target, {toPathBaseDir: BaseDirectory.AppData});
}

// 删除文件
export const deleteAssetItem = (asset: ReleaseAssetListItem, onUpdate: () => void) => {
  MessageBoxUtil.confirm(`是否删除文件 ${asset.filename}`, '删除文件')
    .then(() => {
      remove(asset.path)
        .then(() => {
          onUpdate();
          MessageUtil.success('删除文件成功');
        })
        .catch(e => {
          MessageUtil.error('删除文件失败', e);
        });
    })
}

export const readAssetContent = async (asset: ReleaseAssetListItem) => {
  return readTextFile(asset.path, {baseDir: BaseDirectory.AppData});
}

export const saveAssetContent = async (asset: ReleaseAssetListItem, content: string) => {
  await writeTextFile(asset.path, content, {baseDir: BaseDirectory.AppData});
}

export const renameAsset = async (asset: ReleaseAssetListItem) => {
  await rename(
    asset.path,
    joinPath(asset.folder, `${asset.file_type}|${asset.filename}`),
    {oldPathBaseDir: BaseDirectory.AppData, newPathBaseDir: BaseDirectory.AppData})
}

