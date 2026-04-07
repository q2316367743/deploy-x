<template>
  <t-space v-if="list.length > 0" direction="vertical" size="small">
    <wd-cell-group v-for="item in list" :key="item.id" :title="item.name">
      <wd-cell v-for="sub in item.items" :key="sub.id" :label="sub.key">
        <span v-if="sub.value_type === 'text'">{{ sub.value }}</span>
        <span v-else-if="sub.value_type === 'password'">********</span>
      </wd-cell>
    </wd-cell-group>
  </t-space>
  <t-empty title="空空如也"></t-empty>
</template>
<script lang="ts" setup>
import {listReleaseCredentials} from "@/service/release/ReleaseCredentialService.ts";

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

const list = computedAsync(() => {
  return listReleaseCredentials(props.projectId, props.instanceId)
}, []);

</script>
<style scoped lang="less">

</style>
