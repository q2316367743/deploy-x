import {invoke} from "@tauri-apps/api/core";
import type {DeployStep} from "@/entity";

export async function deployStepList(recordId: string): Promise<Array<DeployStep>> {
  return invoke("deploy_step_list", {recordId});
}
