import {useSql} from "@/lib/sql.ts";
import {type DeployScript, type DeployScriptForm, type DeployScriptList, type DeployScriptView} from "@/entity";

export function listDeployScript(projectId: string, instanceId: string): Promise<Array<DeployScriptList>> {
  return useSql().query<DeployScript>('deploy_script')
    .eq('project_id', projectId)
    .eq('instance_id', instanceId)
    .select('id', 'created_at', 'updated_at', 'name', "script_type", "description", "local_work_dir", "target_dir")
    .list();
}

export async function getDeployScript(id: string): Promise<DeployScriptView | undefined> {
  const t = await useSql().query<DeployScript>('deploy_script')
    .eq('id', id).get();
  if (t) {
    return {
      ...t,
      match_rules: JSON.parse(t.match_rules)
    }
  }
  return undefined;
}

export async function addDeployScript(projectId: string, instanceId: string, form: DeployScriptForm) {
  const now = Date.now();
  await useSql().mapper<DeployScript>('deploy_script').insert({
    ...form,
    project_id: projectId,
    instance_id: instanceId,
    match_rules: JSON.stringify(form.match_rules),
    created_at: now,
    updated_at: now
  })
}

export async function updateDeployScript(id: string, form: DeployScriptForm) {
  const now = Date.now();
  await useSql().mapper<DeployScript>('deploy_script').updateById(id, {
    ...form,
    match_rules: form.match_rules ? JSON.stringify(form.match_rules) : undefined,
    created_at: now,
    updated_at: now
  })
}

export async function deleteDeployScript(id: string) {
  return useSql().mapper<DeployScript>('deploy_script').deleteById(id);
}