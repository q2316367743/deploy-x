<template>
  <app-tool-layout title="概览">
  <div class="release-page">

    <main class="page-main">
      <PhStatsGrid :project-id="projectId" :latest-version="latestVersion"/>

      <div class="table-wrapper">
        <div class="table-header-bar">
          <h2 class="table-title">最近部署</h2>
          <span class="table-hint">仅显示最近 10 个版本</span>
        </div>

        <div class="legend-bar">
          <span class="legend-label">图例：</span>
          <div class="legend-item">
            <div class="legend-dot current"></div>
            <span>当前部署版本</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot empty"></div>
            <span>未部署</span>
          </div>
        </div>

        <div class="matrix-scroll">
          <table class="matrix-table">
            <thead>
            <tr>
              <th class="matrix-th version-header instance-header">
                <div class="th-content">
                  <span class="th-label">版本 / 实例</span>
                </div>
              </th>
              <th v-for="instance in instances" :key="instance.instance_id"
                  class="matrix-th instance-header">
                <div class="th-content">
                  <div class="instance-header-info">
                    <div class="instance-indicator"></div>
                    <span class="instance-name">{{ instance.instance_name }}</span>
                  </div>
                  <div v-if="instance.instance_desc" class="instance-desc">{{ instance.instance_desc }}</div>
                  <div class="instance-current-ver">
                    当前 {{ instance.version_name }}
                  </div>
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
              <td class="matrix-th version-header version-cell">
                <div class="version-info">
                  <div class="version-badge">
                    <span class="version-dot" :class="getVersionStatus(vIndex)"></span>
                    <span class="version-number">{{ version.version }}</span>
                    <span v-if="vIndex === 0" class="latest-badge">最新</span>
                  </div>
                  <div class="version-meta">
                    <span class="version-time">{{ formatDate(version.publish_time) }}</span>
                  </div>
                </div>
              </td>
              <td v-for="instance in instances" :key="`${instance.instance_id}-${version.id}`"
                  class="matrix-td">
                <div v-if="deployMap.has(`${instance.instance_id}-${version.id}`)"
                     class="cell-content cell-current" :class="{'current': instance.version_id === version.id}">
                  {{ version.version }}
                </div>
                <div v-else class="cell-content cell-empty"></div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {ReleaseVersion, ReleaseDeploy} from "@/entity";
import {
  groupReleaseInstanceVersion,
  listReleaseDeployService,
  listReleaseVersionService, type ReleaseInstanceVersion
} from "@/service";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {map} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";
import PhStatsGrid from "@/pages/project/home/components/PhStatsGrid.vue";

const route = useRoute();
const router = useRouter();

const projectId = route.params.id as string;

const instances = ref(new Array<ReleaseInstanceVersion>());
const versions = ref(new Array<ReleaseVersion>());
const deployItems = ref(new Array<ReleaseDeploy>());
const hoveredRow = ref('');

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

const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(projectId, versions.value.map(e => e.id));
};

onMounted(async () => {
  try {
    const [res1, res2] = await Promise.all([
      groupReleaseInstanceVersion(projectId),
      listReleaseVersionService(projectId, 10),
    ]);
    instances.value = res1;
    versions.value = res2
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
