<template>
  <t-card title="实例列表" size="small">
    <t-list split size="small">
      <t-list-item v-for="item in list" :key="item.instance_id">
        <t-list-item-meta :title="item.instance_name" :description="item.instance_desc">
        </t-list-item-meta>
        <template #action>
          <t-tag v-if="item.version_id" theme="primary">{{ item.version_name }}</t-tag>
        </template>
      </t-list-item>
    </t-list>
  </t-card>
</template>
<script lang="ts" setup>
import {groupReleaseInstanceVersion, type ReleaseInstanceVersion} from "@/service";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
})

const list = ref<Array<ReleaseInstanceVersion>>([]);

onMounted(async () => {
  list.value = await groupReleaseInstanceVersion(props.projectId);
})
</script>
<style scoped lang="less">

</style>
