<template>
  <t-layout class="abs-0 overflow-hidden app-container">
    <t-aside class="app-aside" :width="asideWidth">
      <t-menu v-model="value" :collapsed>
        <template #logo>
          <div class="flex justify-left items-center" :style="{marginLeft: collapsed ? undefined : '16px'}">
            <chevron-left-icon class="w-32px h-32px font-size-32px cursor-pointer" @click="goBack"/>
            <div v-if="!collapsed" class="ml-8px font-size-24px font-700">{{ select?.name }}</div>
          </div>
        </template>
        <template #operations>
          <t-button theme="primary" shape="square" variant="text" @click="toggleCollapsed()">
            <template #icon>
              <view-list-icon/>
            </template>
          </t-button>
        </template>
        <t-menu-item :value="homePath" :to="homePath">
          <template #icon>
            <home-icon/>
          </template>
          概览
        </t-menu-item>
        <t-menu-item :value="deployPath" :to="deployPath">
          <template #icon>
            <table1-icon/>
          </template>
          部署
        </t-menu-item>
        <t-menu-item :value="versionPath" :to="versionPath">
          <template #icon>
            <git-branch-icon/>
          </template>
          版本
        </t-menu-item>
        <t-menu-item :value="instancePath" :to="instancePath">
          <template #icon>
            <data-base-icon/>
          </template>
          实例
        </t-menu-item>
<!--        <t-menu-item :value="settingPath" :to="settingPath">-->
<!--          <template #icon>-->
<!--            <setting-icon/>-->
<!--          </template>-->
<!--          设置-->
<!--        </t-menu-item>-->
      </t-menu>
    </t-aside>
    <t-content class="h-100vh overflow-hidden app-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="[]">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {
  ChevronLeftIcon,
  DataBaseIcon, GitBranchIcon,
  HomeIcon, Table1Icon,
  ViewListIcon
} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";
import type {ReleaseProject} from "@/entity";
import {getReleaseProject} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const projectId = route.params.id;

const homePath = `/release/${projectId}/home`;
const deployPath = `/release/${projectId}/deploy`;
const versionPath = `/release/${projectId}/version`;
const instancePath = `/release/${projectId}/instance`;
// const settingPath = `/release/${projectId}/setting`;

const select = ref<ReleaseProject>();

const value = ref(homePath);

const asideWidth = computed(() => {
  return collapsed.value ? '64px' : '232px';
})

const goBack = () => router.push("/home");

onMounted(async () => {
  try {
    select.value = await getReleaseProject(projectId as string);
  } catch (e) {
    MessageUtil.error("获取项目失败", e);
    router.back();
  }
})

</script>
<style scoped lang="less">
.app-container {
  .app-aside {
    border-right: 1px solid var(--td-border-level-1-color);
    box-shadow: var(--td-shadow-1);
    overflow-x: hidden;
    overflow-y: auto;
    flex-shrink: 0;
  }

}
</style>
