import {invoke} from "@tauri-apps/api/core";
import type {DeployLog} from "@/entity";

export async function deployLogList(stepId: string): Promise<Array<DeployLog>> {
  return invoke("deploy_log_list", {stepId});
}
