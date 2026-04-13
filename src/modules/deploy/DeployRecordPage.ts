import {invoke} from "@tauri-apps/api/core";
import type {PageResponse} from "@/global/CommonType.ts";
import type {DeployRecord} from "@/entity";

export async function deployRecordPage(pageNum: number, pageSize: number, scriptId: string): Promise<PageResponse<DeployRecord>> {
  return invoke("deploy_record_page", {pageNum, pageSize, scriptId});
}
