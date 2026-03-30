<template>
  <div v-if="version" class="pvm-general">
    <wd-cell-group>
      <wd-cell label="版本名称" :value="version.version"/>
      <wd-cell label="发布时间" :value="formatDate(version.publish_time)"/>
      <wd-cell label="发布人" :value="version.publish_user"/>
    </wd-cell-group>
  </div>
  <loading-result v-else/>
</template>
<script lang="ts" setup>
import type {ReleaseVersion} from "@/entity";
import {getReleaseVersionService} from "@/service";
import {formatDate} from "@/util/lang/FormatUtil.ts";

const props = defineProps({
  versionId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
});

const version = ref<ReleaseVersion>()

onMounted(async () => {
  version.value = await getReleaseVersionService(props.versionId, props.projectId);
})
</script>
<style scoped lang="less">
.pvm-general {
  padding: 8px;
}
</style>
