<template>
  <div class="pi-aside">
    <div class="pia-header">
      <t-button theme="primary" block @click="handleAdd()">创建实例</t-button>
    </div>
    <div class="pia-body">
      <div v-for="instance in instances" :class="['pia-item', {active: modelValue === instance.id}]" :key="instance.id"
           @click="handleSelect(instance)">
        <div class="pia-item-title">{{ instance.name }}</div>
        <div class="flex justify-between">
          <t-tag v-if="instance.current_version_id" variant="outline" theme="primary" class="pia-item-version">
            {{ instance.version }}
          </t-tag>
          <t-tag v-else variant="outline" theme="warning" class="pia-item-version">暂未部署</t-tag>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {listReleaseInstanceWithVersion, type ReleaseInstanceWithVersion} from "@/service";
import {openReleaseInstanceAdd} from "@/pages/project/components/ReleaseInstanceEdit.tsx";

const modelValue = defineModel({
  type: String,
  default: ''
})

const route = useRoute();

const projectId = route.params.id as string;

const instances = ref<Array<ReleaseInstanceWithVersion>>([]);

const init = async () => {
  instances.value = await listReleaseInstanceWithVersion(projectId);
};

const handleSelect = (instance: ReleaseInstanceWithVersion) => {
  if (modelValue.value === instance.id) {
    modelValue.value = '';
    return;
  }
  modelValue.value = instance.id;
};

const handleAdd = () => {
  openReleaseInstanceAdd(projectId, init);
}

onMounted(() => {
  init();
})
</script>
<style scoped lang="less">
.pi-aside {
  width: 232px;
  flex-shrink: 0;
  border-right: 1px solid var(--td-border-level-1-color);

  .pia-header {
    padding: 8px 8px 7px;
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  .pia-body {
    height: calc(100% - 48px);
    overflow: auto;

    .pia-item {
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

      .pia-item-title {
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

      .pia-item-version {
        margin-top: 4px;
      }
    }
  }
}
</style>
