<template>
  <div class="pv-aside">
    <div class="pva-header">
      <t-button theme="primary" block @click="handleAdd">创建版本</t-button>
    </div>
    <div class="pva-body">
      <div v-for="version in versions" :class="['pva-item', {active: modelValue === version.id}]" :key="version.id"
           @click="handleSelect(version)"
           @contextmenu="openReleaseVersionContextmenu(version, () => handleLoad(version.id), $event)">
        <div class="pva-item-title">{{ version.version }}</div>
        <div class="flex justify-between">
          <div class="pva-item-time">{{ formatDate(version.publish_time) }}</div>
          <t-tag v-if="version.publish_user" variant="outline" theme="primary" class="pva-item-user">{{ version.publish_user }}</t-tag>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseVersion} from "@/entity";
import {listReleaseVersionService} from "@/service";
import {formatDate} from "@/util/lang/FormatUtil.ts"
import {openReleaseVersionAdd, openReleaseVersionContextmenu} from "@/pages/project/components/ReleaseVersionEdit.tsx";

const modelValue = defineModel({
  type: String,
  default: ''
})

const route = useRoute();

const projectId = route.params.id as string;

const versions = ref<Array<ReleaseVersion>>([]);

const init = async () => {
  versions.value = await listReleaseVersionService(projectId);
};

const handleSelect = (version: ReleaseVersion) => {
  if (modelValue.value === version.id) {
    modelValue.value = '';
    return;
  }
  modelValue.value = version.id;
};

const handleAdd = () => {
  openReleaseVersionAdd(projectId, init);
}

const handleLoad = (id: string) => {
  init();
  if (modelValue.value === id) {
    modelValue.value = '';
  }
}

onMounted(() => {
  init();
})
</script>
<style scoped lang="less">
.pv-aside {
  width: 232px;
  flex-shrink: 0;
  border-right: 1px solid var(--td-border-level-1-color);

  .pva-header {
    padding: 8px 8px 7px;
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  .pva-body {
    height: calc(100% - 48px);
    overflow: auto;

    .pva-item {
      border-bottom: 1px solid var(--td-border-level-1-color);
      padding: 8px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &.active {
        background-color: var(--td-bg-color-container-active);
      }

      .pva-item-title {
        font-size: 1.1rem;
        font-weight: bold;
        display: flex;
        font-family: 'JetBrains Mono', monospace;

        &::before {
          content: '';
          display: block;
          width: 4px;
          height: 16px;
          margin-top: 2px;
          background-color: var(--td-brand-color);
          margin-right: 8px;
        }
      }

      .pva-item-time {
        color: var(--td-text-color-placeholder);
      }
    }
  }
}
</style>
