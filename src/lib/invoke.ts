import {invoke} from "@tauri-apps/api/core";

/**
 * 将指定文件进行压缩
 * @param path 压缩文件保存的路径
 * @param mapper 映射器，source 是磁盘上的文件路径，target 是压缩包中的绝对路径
 */
export function compressTo(path: string, mapper: Array<{ source: string, target: string }>) {
  return invoke('compress_to', {path, mapper})
}