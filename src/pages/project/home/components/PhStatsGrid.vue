<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">版本总数</div>
      <div class="stat-value">{{ versionCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">实例数量</div>
      <div class="stat-value">{{ instanceCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">已部署</div>
      <div class="stat-value accent-green">{{ deployCount }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">最新版本</div>
      <div class="stat-value accent-blue">{{ latestVersion }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  countReleaseDeploy,
  countReleaseInstance,
  countReleaseVersion,
} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  latestVersion: String
})

const instanceCount = ref(0);
const versionCount = ref(0);
const deployCount = ref(0);


onMounted(async () => {
  try {
    // 先获取实例和版本列表
    const [res3, res4, res5] = await Promise.all([
      countReleaseInstance(props.projectId),
      countReleaseVersion(props.projectId),
      countReleaseDeploy(props.projectId)
    ]);
    instanceCount.value = res3;
    versionCount.value = res4;
    deployCount.value = res5;
  } catch (e) {
    MessageUtil.error("获取项目失败", e);
  }
})
</script>
<style scoped lang="less">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  padding: 16px;
  .stat-label {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    font-family: 'JetBrains Mono', monospace;

    &.accent-green {
      color: var(--td-success-color);
    }

    &.accent-blue {
      color: var(--td-brand-color);
    }
  }
}

</style>
