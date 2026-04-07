<template>
  <div class="p-8px">
    <div>
      <t-button theme="primary">新建凭证组</t-button>
    </div>
    <t-space v-if="list.length > 0" direction="vertical" size="small">
      <wd-cell-group v-for="item in list" :key="item.id" :title="item.name">
        <wd-cell v-for="sub in item.items" :key="sub.id" :label="sub.key">
          <span v-if="sub.value_type === 'text'">{{ sub.value }}</span>
          <span v-else-if="sub.value_type === 'password'">********</span>
        </wd-cell>
      </wd-cell-group>
    </t-space>
  </div>
</template>
<script lang="ts" setup>
import {listReleaseCredentials, type ReleaseCredentialView} from "@/service/release/ReleaseCredentialService.ts";

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

onMounted(async () => {
  list.value = await listReleaseCredentials(props.projectId, props.instanceId);
})
</script>
<style scoped lang="less">

</style>
