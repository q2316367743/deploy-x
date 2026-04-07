<template>
  <div class="p-8px">
    <div class="mb-8px">
      <t-button theme="primary" @click="openAddCredentialDrawer(projectId, instanceId, listCredential)">新建凭证组
      </t-button>
    </div>
    <t-space v-if="list.length > 0" direction="vertical" size="small" class="w-full">
      <wd-cell-group v-for="item in list" :key="item.id" :title="item.name">
        <template #actions>
          <t-button theme="primary" size="small"
                    @click="openUpdateCredentialDrawer(projectId, instanceId, item, listCredential)">更新
          </t-button>
        </template>
        <wd-cell v-for="sub in item.items" :key="sub.id" :label="sub.key">
          <div class="w-400px">
            <t-input v-model="sub.value" :type="sub.value_type" @change="valueReleaseCredentialWrap(sub.id, $event)"/>
          </div>
        </wd-cell>
      </wd-cell-group>
    </t-space>
  </div>
</template>
<script lang="ts" setup>
import {
  listReleaseCredentials,
  type ReleaseCredentialView,
  valueReleaseCredential
} from "@/service/release/ReleaseCredentialService.ts";
import {openAddCredentialDrawer} from "@/pages/project/components/credential/edit/func/AddCredentialDrawer.tsx";
import {openUpdateCredentialDrawer} from "@/pages/project/components/credential/edit/func/UpdateCredentialDrawer.tsx";
import {debounce} from "es-toolkit";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  instanceId: {
    type: String,
    required: true,
  }
});

const list = ref(new Array<ReleaseCredentialView>());

const listCredential = async () => {
  list.value = await listReleaseCredentials(props.projectId, props.instanceId);
}

const valueReleaseCredentialWrap = debounce((id: string, val: string | number) => {
  valueReleaseCredential(id, `${val}`);
}, 300);

onMounted(() => {
  listCredential();
})
</script>
<style scoped lang="less">

</style>
