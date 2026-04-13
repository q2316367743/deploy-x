import type {PageResponse} from "@/global/CommonType.ts";
import type {DeployRecord} from "@/entity";

export async function deployRecordPage(pageNum: number, pageSize: number, scriptId: string): Promise<PageResponse<DeployRecord>> {
}