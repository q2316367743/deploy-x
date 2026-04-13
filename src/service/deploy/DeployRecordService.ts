import {useLogSql} from "@/lib/sql.ts";
import type {DeployRecord} from "@/entity";

export function listDeployRecord(pageNum: number, pageSize: number, scriptId: string) {
  return useLogSql().query<DeployRecord>('deploy_record')
    .eq('script_id', scriptId)
    .orderByDesc('created_at')
    .page(pageNum, pageSize);
}