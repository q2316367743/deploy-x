<template>
  <div class="version-title">
    <div>{{ version.version }}</div>
    <div class="version-log-title-divider">-</div>
    <div>{{ formatDatetime(version.publish_time) }}</div>
    <div v-if="version.publish_user" class="version-log-title-divider">-</div>
    <div v-if="version.publish_user">{{ version.publish_user }}</div>
  </div>
</template>
<script lang="ts" setup>
import type {PropType} from "vue";
import type {ReleaseVersion} from "@/entity";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";

defineProps({
  version: {
    type: Object as PropType<ReleaseVersion>,
    required: true,
  }
})
</script>
<style scoped lang="less">
.version-title {
  display: flex;
  align-items: center;
  color: var(--td-brand-color);
  font-weight: 500;
  padding-bottom: 4px;
  width: fit-content;

  .version-log-title-divider {
    margin: 0 8px;
  }
}
</style>
