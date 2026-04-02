<template>
  <app-tool-layout title="部署">
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
                  <span class="th-label">版本 \ 实例</span>
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
                  <div v-if="instance.version_name" class="instance-current-ver">
                    当前 {{ instance.version_name }}
                  </div>
                  <div v-else class="instance-not-ver">
                    暂未部署
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
                <div class="version-info" :title="version.publish_user">
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
                <!-- 当前部署版本 -->
                <div v-if="instance.version_id === version.id"
                     class="cell-content cell-current"
                     @click="openReleaseDeployInfoWrap(instance, version)">
                  {{ version.version }}
                </div>
                <!-- 已经过的旧版本 -->
                <div v-else-if="deployMap.has(`${instance.instance_id}-${version.id}`)"
                     class="cell-content cell-old-deploy">
                  {{ version.version }}
                </div>
                <!-- 可升级版本（点击部署 -->
                <div v-else-if="(instance?.publish_time || 0) < version.publish_time"
                     class="cell-content cell-upgrade"
                     @click="addDeploy(instance.instance_id, version.id)">
                  升级
                </div>
                <!-- 未到达版本 -->
                <div v-else-if="(instance?.publish_time || 0) > version.publish_time"
                     class="cell-content cell-old">
                  已过
                </div>
                <!-- 异常情况 -->
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
  versions.value = await listReleaseVersionService(projectId);
};
const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(projectId, versions.value.map(e => e.id));
};

const openReleaseDeployInfoWrap = (instance: ReleaseInstanceVersion, version: ReleaseVersion) => {
  const deploy = deployMap.value.get(`${instance.instance_id}-${version.id}`);
  if (!deploy) {
    MessageUtil.error("系统异常，部署数据未找到");
    return;
  }
  openReleaseDeployInfo({deploy, instance, version});
}

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
