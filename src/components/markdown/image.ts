import {getExtname, joinPath} from "@/util/lang/FileUtil.ts";
import {APP_DATA_ASSET_DIR} from "@/global/Constants.ts";
import {BaseDirectory, exists, mkdir, writeFile} from "@tauri-apps/plugin-fs";
import {useSnowflake} from "@/util";
import {convertFileSrc} from "@tauri-apps/api/core";
import type {ReleaseAssetScope} from "@/pages/project/components/asset/types.ts";

interface ImageUploaderResult {
  url: string;
  alt: string;
  title: string;
}


async function fileToUint8Array(file: File) {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * markdown 文件上传
 * @param scope 资源作用域
 * @param scopeId 资源 ID
 * @param file 文件
 */
export const markdownImageUploader = async (scope: ReleaseAssetScope, scopeId: string, file: File): Promise<ImageUploaderResult> => {
  //可自定义图片上传逻辑
  // 获取时间
  const date = new Date();
  // 获取路径：资源目录/资源 ID/.image/年-月/日
  const folder = joinPath(APP_DATA_ASSET_DIR(), scope, scopeId, ".image", `${date.getFullYear()}-${date.getMonth() + 1}`, `${date.getDate()}`.padStart(2, "0"))
  if (!await exists(folder)) {
    await mkdir(folder, {recursive: true, baseDir: BaseDirectory.AppData});
  }
  const originFilename = file.name;
  const originExtname = getExtname(originFilename);
  const filename = `${useSnowflake().nextId()}.${originExtname}`;
  const path = joinPath(folder, filename);
  // 写入文件
  await writeFile(path, await fileToUint8Array(file), {createNew: true, baseDir: BaseDirectory.AppData});
  return {
    url: convertFileSrc(path),
    alt: path,
    title: filename
  }
}
