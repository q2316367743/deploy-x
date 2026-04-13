import {invoke} from "@tauri-apps/api/core";
import {openDeployStepListDrawer} from "@/pages/project/components/deploy/DeployStepListDrawer.tsx";
import {getDeployScript, getHost, getHostCredential} from "@/service";
import {buildHostCore, type DeployScriptView, type HostCore} from "@/entity";

export interface DeployInvokeProp extends Record<string, unknown>{
  // 执行的脚本
  script: DeployScriptView;
  // 主机信息，只有脚本是远程脚本才有效
  host: HostCore;
  // 此时的版本 ID
  version_id: string;
}

export async function deployInvoke(scriptId: string) {
  const script = await getDeployScript(scriptId);
  if (!script) {
    return Promise.reject("无法找到部署脚本");
  }
  let host = buildHostCore();

  if (script.script_type === 'remote') {
    const res = await getHost(script.target_host_id);
    if (!res) {
      return Promise.reject("远程部署脚本无法找到远程服务器");
    }
    host = res;
    if (host.auth_type === 'credential') {
      const hc = await getHostCredential(host.credential_id);
      if (!hc) {
        return Promise.reject("远程服务器凭证未找到")
      }
      host.auth_type = hc.type;
      host.auth_user = hc.username;
      host.auth_password = hc.password;
      host.auth_secret = hc.secret;
    }
  }

  const props: DeployInvokeProp = {
    script,
    host,
    version_id: script.version_id
  }

  const recordId = await invoke<string>('deploy_execute', props);
  // 打开步骤对话框
  openDeployStepListDrawer(recordId);
}