<template>
  <app-tool-layout title="一张表">
    <template #action>
      <t-space size="small">
        <t-button theme="default" variant="outline" class="action-btn"
                  @click="openReleaseVersionAdd(projectId, listVersion)">
          <template #icon>
            <add-icon/>
          </template>
          新建版本
        </t-button>
        <t-button theme="primary" class="action-btn primary" @click="openReleaseInstanceAdd(projectId, listInstance)">
          <template #icon>
            <add-icon/>
          </template>
          添加实例
        </t-button>
      </t-space>
    </template>
    <main class="page-main">
      <div class="table-wrapper">
        <div class="legend-bar">
          <span class="legend-label">图例：</span>
          <div class="legend-item">
            <div class="legend-dot current"></div>
            <span>当前部署版本</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot upgrade"></div>
            <span>可升级版本（点击部署）</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot old"></div>
            <span>已经过的旧版本</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot empty"></div>
            <span>未到达版本</span>
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
                  class="matrix-th instance-header clickable"
                  @click="openReleaseInstanceInfo(projectId, instance.instance_id)"
                  @contextmenu="openReleaseInstanceContextmenu(instance, listInstance, $event)">
                <div class="th-content">
                  <div class="instance-header-info">
                    <div class="instance-indicator"></div>
                    <span class="instance-name">{{ instance.instance_name }}</span>
                  </div>
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
              <td class="matrix-th version-header version-cell clickable"
                  @click="openReleaseVersionInfo(version.project_id, version.id)"
                  @contextmenu="openReleaseVersionContextmenu(version, listVersion, $event)">
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
                <div v-if="isLatestDeployedVersion(instance.instance_id, version.id)"
                     class="cell-content cell-current"
                     @click="openReleaseDeployInfo({deploy: deployMap.get(`${instance.instance_id}-${version.id}`)!, instance, versions, deployItems})">
                  {{ version.version }}
                </div>
                <div v-else-if="deployMap.has(`${instance.instance_id}-${version.id}`)"
                     class="cell-content cell-old-deploy">
                  {{ version.version }}
                </div>
                <div v-else-if="canDeploy(instance.instance_id, version.id)"
                     class="cell-content cell-upgrade"
                     @click="addDeploy(instance.instance_id, version.id)">
                  升级
                </div>
                <div v-else-if="isOldVersion(instance.instance_id, version.id)"
                     class="cell-content cell-old">
                  已过
                </div>
                <div v-else class="cell-content cell-empty"></div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import type {ReleaseVersion, ReleaseDeploy} from "@/entity";
import {openReleaseInstanceInfo} from "./func/ReleaseInstanceInfo.tsx";
import {openReleaseVersionInfo} from "./func/ReleaseVersionInfo.tsx";
import {
  openReleaseInstanceAdd, openReleaseInstanceContextmenu,
} from "../components/ReleaseInstanceEdit.tsx";
import {
  openReleaseVersionAdd, openReleaseVersionContextmenu,
} from "../components/ReleaseVersionEdit.tsx";
import {openReleaseDeployInfo} from "./func/ReleaseDeployInfo.tsx";
import {openReleaseDeployAdd} from "./func/ReleaseDeployEdit.tsx";
import {
  groupReleaseInstanceVersion,
  listReleaseDeployService,
  listReleaseVersionService, type ReleaseInstanceVersion
} from "@/service";
import {AddIcon} from "tdesign-icons-vue-next";
import {formatDate} from "@/util/lang/FormatUtil.ts";
import {map} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const projectId = route.params.id as string;

const instances = ref(new Array<ReleaseInstanceVersion>());
const versions = ref(new Array<ReleaseVersion>());
const deployItems = ref(new Array<ReleaseDeploy>());
const hoveredRow = ref('');

const deployMap = computed(() => map(deployItems.value, (e) => `${e.instance_id}-${e.version_id}`));

const getVersionStatus = (index: number) => {
  if (index === 0) return 'latest';
  if (index <= 2) return 'stable';
  return 'old';
};

const isLatestDeployedVersion = (instanceId: string, versionId: string) => {
  const deployedVersions = versions.value.filter(v => deployMap.value.has(`${instanceId}-${v.id}`));
  if (deployedVersions.length === 0) return false;
  const latestDeployedIndex = Math.min(...deployedVersions.map(v => versions.value.findIndex(ver => ver.id === v.id)));
  return versions.value[latestDeployedIndex]?.id === versionId;
};

const canDeploy = (instanceId: string, versionId: string) => {
  if (deployMap.value.has(`${instanceId}-${versionId}`)) return false;
  const deployedVersions = versions.value.filter(v => deployMap.value.has(`${instanceId}-${v.id}`));
  if (deployedVersions.length === 0) return true;
  const latestDeployedIndex = Math.min(...deployedVersions.map(v => versions.value.findIndex(ver => ver.id === v.id)));
  const targetVersionIndex = versions.value.findIndex(v => v.id === versionId);
  return targetVersionIndex < latestDeployedIndex;
};

const isOldVersion = (instanceId: string, versionId: string) => {
  if (deployMap.value.has(`${instanceId}-${versionId}`)) return false;
  const deployedVersions = versions.value.filter(v => deployMap.value.has(`${instanceId}-${v.id}`));
  if (deployedVersions.length === 0) return false;
  const latestDeployedIndex = Math.min(...deployedVersions.map(v => versions.value.findIndex(ver => ver.id === v.id)));
  const targetVersionIndex = versions.value.findIndex(v => v.id === versionId);
  return targetVersionIndex > latestDeployedIndex;
};

const addDeploy = (instanceId: string, versionId: string) => {
  openReleaseDeployAdd({
    instance_id: instanceId,
    instanceName: instances.value.find(e => e.instance_id === instanceId)?.instance_name || instanceId,
    version_id: versionId,
    versionName: versions.value.find(e => e.id === versionId)?.version || versionId,
    project_id: projectId,
    onUpdate: listDeploy
  })
}

const listInstance = async () => {
  instances.value = await groupReleaseInstanceVersion(projectId);
};
const listVersion = async () => {
  versions.value = await listReleaseVersionService(projectId, 10);
};
const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(projectId, versions.value.map(e => e.id));
};

onMounted(async () => {
  try {
    await Promise.all([listInstance(), listVersion()]);
    await listDeploy();
  } catch (e) {
    MessageUtil.error("获取项目失败", e);
    router.back();
  }
})
</script>
<style scoped lang="less">
@import "less/project-table.less";
</style>
