import type {
  ReleaseCredentialGroup,
  ReleaseCredentialGroupCore,
  ReleaseCredentialItem,
  ReleaseCredentialItemCore
} from "@/entity";
import {useSql} from "@/lib/sql.ts";
import {group} from "@/util";

export interface ReleaseCredentialView extends ReleaseCredentialGroup {
  items: Array<ReleaseCredentialItem>;
}

export async function listReleaseCredentials(projectId: string, instanceId: string): Promise<Array<ReleaseCredentialView>> {
  const groups = await useSql().query<ReleaseCredentialGroup>('release_credential_group')
    .eq('project_id', projectId)
    .eq('instance_id', instanceId)
    .list();
  const items = await useSql().query<ReleaseCredentialItem>('release_credential_item')
    .eq('project_id', projectId)
    .eq('instance_id', instanceId)
    .list();
  const itemGroup = group(items, 'group_id');
  return groups.map(g => ({
    ...g,
    items: itemGroup.getOrDefault(g.id, []),
  }))
}

export interface ReleaseCredentialAddFrom extends ReleaseCredentialGroupCore {
  items: Array<ReleaseCredentialItemCore>;
}

export async function addReleaseCredential(projectId: string, instanceId: string, form: ReleaseCredentialAddFrom): Promise<void> {
  // 新增分组
  const {id} = await useSql().mapper<ReleaseCredentialGroup>('release_credential_group').insert({
    name: form.name,
    desc: form.desc,
    project_id: projectId,
    instance_id: instanceId,
  });
  await Promise.all(form.items.map(item => useSql().mapper<ReleaseCredentialItem>('release_credential_item').insert({
    key: item.key,
    value: item.value,
    value_type: item.value_type,
    desc: item.desc,
    project_id: projectId,
    instance_id: instanceId,
    group_id: id
  })));
}

export async function valueReleaseCredential(itemId: string, value: string) {
  await useSql().mapper<ReleaseCredentialItem>('release_credential_item').updateById(itemId, {
    value: value,
    updated_at: Date.now()
  })
}