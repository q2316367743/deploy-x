<template>
  <div class="release-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-icon">
            <svg class="logo-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">发版助手</h1>
            <p class="header-subtitle">项目版本部署管理</p>
          </div>
        </div>

      </div>
    </header>

    <main class="page-main">
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

      <div class="matrix-container">
        <div class="matrix-scroll">
          <table class="matrix-table">
            <thead>
            <tr>
              <th class="matrix-th version-header instance-header">
                <div class="th-content">
                  <span class="th-label">版本 / 实例</span>
                </div>
              </th>
              <th v-for="instance in instances" :key="instance.id"
                  class="matrix-th instance-header clickable">
                <div class="th-content">
                  <div class="instance-header-info">
                    <div class="instance-indicator"></div>
                    <span class="instance-name">{{ instance.name }}</span>
                  </div>
                  <div v-if="instance.desc" class="instance-desc">{{ instance.desc }}</div>
                </div>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(version, vIndex) in versions" :key="version.id"
                class="version-row"
                :class="{ 'row-hover': hoveredRow === version.id }"
                @mouseenter="hoveredRow = version.id"
                @mouseleave="hoveredRow = ''">
              <td class="matrix-th version-header version-cell clickable">
                <div class="version-info">
                  <div class="version-badge">
                    <span class="version-dot" :class="getVersionStatus(vIndex)"></span>
                    <span class="version-number">{{ version.version }}</span>
                  </div>
                  <div class="version-meta">
                    <span class="version-time">{{ formatDate(version.publish_time) }}</span>
                  </div>
                </div>
              </td>
              <td v-for="instance in instances" :key="`${instance.id}-${version.id}`"
                  class="matrix-td"
                  :class="getCellClass(instance.id, version.id)">
                <t-button v-if="deployMap.has(`${instance.id}-${version.id}`)"
                          theme="success" variant="outline">
                  <template #icon>
                    <check-icon/>
                  </template>
                  已部署
                </t-button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseInstance, ReleaseVersion, ReleaseDeploy} from "@/entity";
import {
  countReleaseDeploy,
  countReleaseInstance, countReleaseVersion,
  listReleaseDeployService,
  listReleaseInstanceService,
  listReleaseVersionService
} from "@/service";
import { CheckIcon} from "tdesign-icons-vue-next";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {map} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const projectId = route.params.id as string;

const instances = ref(new Array<ReleaseInstance>());
const versions = ref(new Array<ReleaseVersion>());
const deployItems = ref(new Array<ReleaseDeploy>());
const hoveredRow = ref('');

const instanceCount = ref(0);
const versionCount = ref(0);
const deployCount = ref(0);

const deployMap = computed(() => map(deployItems.value, (e) => `${e.instance_id}-${e.version_id}`));

const latestVersion = computed(() => {
  if (versions.value.length === 0) return '-';
  return versions.value[0]?.version ?? '-';
});

const getVersionStatus = (index: number) => {
  if (index === 0) return 'latest';
  if (index <= 2) return 'stable';
  return 'old';
};

const getCellClass = (instanceId: string, versionId: string) => {
  const isDeployed = deployMap.value.has(`${instanceId}-${versionId}`);
  if (isDeployed) {
    return 'cell-current';
  }
  return '';
};

const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(projectId, versions.value.map(e => e.id));
};

onMounted(async () => {
  try {
    // 先获取实例和版本列表
    const [res1, res2, res3, res4, res5] = await Promise.all([
      listReleaseInstanceService(projectId),
      listReleaseVersionService(projectId),
      countReleaseInstance(projectId),
      countReleaseVersion(projectId),
      countReleaseDeploy(projectId)
    ]);
    instances.value = res1;
    versions.value = res2
    instanceCount.value = res3;
    versionCount.value = res4;
    deployCount.value = res5;
      // 再获取部署列表
    await listDeploy();
  } catch (e) {
    MessageUtil.error("获取项目失败", e);
    router.back();
  }
})
</script>
<style scoped lang="less">
@import "project-home.less";
</style>
