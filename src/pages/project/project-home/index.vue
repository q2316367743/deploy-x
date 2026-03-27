<template>
  <div class="release-content">
    <table class="release-table">
      <thead>
      <tr>
        <th class="corner-cell">
          <span class="header-label">版本</span>
        </th>
        <th v-for="instance in instances" :key="instance.id" class="instance-cell"
            @click="openReleaseInstanceInfo(instance.project_id, instance.id)"
            @contextmenu="openReleaseInstanceContextmenu(instance, listInstance, $event)">
          <div class="instance-name">{{ instance.name }}</div>
          <div v-if="instance.desc" class="instance-desc">{{ instance.desc }}</div>
        </th>
        <th class="action-cell">
          <t-button theme="primary" variant="text" shape="square"
                    @click="openReleaseInstanceAdd(projectId, listInstance)">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="version in versions" :key="version.id"
          :class="{ 'row-hover': hoveredRow === version.id }"
          @mouseenter="hoveredRow = version.id"
          @mouseleave="hoveredRow = ''">
        <td class="corner-cell"
            @click="openReleaseVersionInfo(version.project_id, version.id)"
            @contextmenu="openReleaseVersionContextmenu(version, listVersion, $event)">
          <div class="version-info">
            <div class="version-number">
              <span class="version-title">{{ version.version }}</span>
              <t-tag v-if="version.publish_user" variant="outline" theme="primary" class="version-user">
                {{ version.publish_user }}
              </t-tag>
            </div>
            <div class="version-meta">
              <span class="version-time">{{ formatDate(version.publish_time) }}</span>
            </div>
          </div>
        </td>
        <td v-for="instance in instances" :key="`${instance.id}-${version.id}`">
          <div v-if="deployMap.has(`${instance.id}-${version.id}`)" class="deploy-badge deployed"
               @click="openReleaseDeployInfo({deploy: deployMap.get(`${instance.id}-${version.id}`)!, instance,versions, deployItems})">
            <check-icon size="16px"/>
            <span>已部署</span>
          </div>
          <div v-else class="deploy-badge deploy-action" @click="addDeploy(instance.id, version.id)">
            <span>部署</span>
          </div>
        </td>
        <td class="action-cell"></td>
      </tr>
      </tbody>
      <tfoot>
      <tr>
        <td class="corner-cell">
          <t-button theme="primary" variant="text" block
                    @click="openReleaseVersionAdd(projectId, listVersion)">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
        </td>
      </tr>
      </tfoot>
    </table>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseInstance, ReleaseVersion, ReleaseDeploy} from "@/entity";
import {openReleaseInstanceInfo} from "./func/ReleaseInstanceInfo.tsx";
import {openReleaseVersionInfo} from "./func/ReleaseVersionInfo.tsx";
import {
  openReleaseInstanceAdd, openReleaseInstanceContextmenu,
} from "./func/ReleaseInstanceEdit.tsx";
import {
  openReleaseVersionAdd, openReleaseVersionContextmenu,
} from "./func/ReleaseVersionEdit.tsx";
import {openReleaseDeployInfo} from "./func/ReleaseDeployInfo.tsx";
import {openReleaseDeployAdd} from "./func/ReleaseDeployEdit.tsx";
import {
  listReleaseDeployService,
  listReleaseInstanceService,
  listReleaseVersionService
} from "@/service";
import {AddIcon, CheckIcon} from "tdesign-icons-vue-next";
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

const deployMap = computed(() => map(deployItems.value, (e) => `${e.instance_id}-${e.version_id}`));

const addDeploy = (instanceId: string, versionId: string) => {
  openReleaseDeployAdd({
    instance_id: instanceId,
    version_id: versionId,
    project_id: projectId,
    onUpdate: listDeploy
  })
}

const listInstance = async () => {
  instances.value = await listReleaseInstanceService(projectId);
};
const listVersion = async () => {
  versions.value = await listReleaseVersionService(projectId);
};
const listDeploy = async () => {
  deployItems.value = await listReleaseDeployService(projectId);
};

onMounted(async () => {
  try {
    await Promise.all([listInstance(), listVersion(), listDeploy()]);
  } catch (e) {
    MessageUtil.error("获取项目失败", e);
    router.back();
  }
})
</script>
<style scoped lang="less">
@import "less/ReleaseContent.less";
</style>
