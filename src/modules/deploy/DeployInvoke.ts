import {invoke} from "@tauri-apps/api/core";
import {openDeployStepListDrawer} from "@/pages/project/components/deploy/DeployStepListDrawer.tsx";
import {APP_DATA_DB_PATH} from "@/global/Constants.ts";
import {getDeployScript} from "@/service";
import type {DeployScriptView} from "@/entity";

export interface DeployInvokeProp extends Record<string, unknown>{
  /**
   * 数据库路径
   */
  database: string;
  /**
   * 执行的脚本
   */
  script: DeployScriptView;
}

export async function deployInvoke(scriptId: string) {
  const script = await getDeployScript(scriptId);
  if (!script) {
    return Promise.reject("Could not find deployScript");
  }
  const props: DeployInvokeProp = {
    database: APP_DATA_DB_PATH('log'),
    script
  }

  const recordId = await invoke<string>('deploy_execute', props);
  // 打开步骤对话框
  openDeployStepListDrawer(recordId);
}