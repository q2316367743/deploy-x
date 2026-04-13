import {useLogSql} from "@/lib/sql.ts";
import type {DeployLog} from "@/entity";

export function listDeployLog(stepId: string) {
  return useLogSql().query<DeployLog>('deploy_log')
    .eq('step_id', stepId)
    .orderByDesc('created_at')
    .list()
}