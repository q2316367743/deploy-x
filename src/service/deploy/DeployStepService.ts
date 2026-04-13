import {useLogSql} from "@/lib/sql.ts";
import type {DeployStep} from "@/entity";

export function listDeployStep(recordId: string) {
  return useLogSql().query<DeployStep>('deploy_step')
    .eq('record_id', recordId)
    .orderByDesc('created_at')
    .list();
}