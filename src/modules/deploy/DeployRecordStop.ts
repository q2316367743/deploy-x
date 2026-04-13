import {invoke} from "@tauri-apps/api/core";

export async function deployRecordStop(recordId: string): Promise<void> {
  return invoke("deploy_record_stop", {recordId});
}
