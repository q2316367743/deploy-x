<template>
  <t-layout class="abs-0 overflow-hidden app-container">
    <t-aside class="app-aside" :width="asideWidth">
      <t-menu v-model="value" :collapsed>
        <template #logo>
          <div class="flex justify-left items-center" :style="{marginLeft: collapsed ? undefined : '16px'}">
            <chevron-left-icon class="w-32px h-32px font-size-32px cursor-pointer" @click="goBack"/>
            <div v-if="!collapsed" class="ml-8px font-size-24px font-700">主机管理</div>
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
          主机管理
        </t-menu-item>
        <t-menu-item :value="credentialPath" :to="credentialPath">
          <template #icon>
            <key-icon/>
          </template>
          凭证管理
        </t-menu-item>
      </t-menu>
    </t-aside>
    <t-content class="h-100vh overflow-hidden app-content">
      <router-view v-slot="{ Component, route }">
        <keep-alive :max="20">
          <component :is="Component" :key="route.fullPath"/>
        </keep-alive>
      </router-view>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {
  ChevronLeftIcon,
  HomeIcon, KeyIcon,
  ViewListIcon
} from "tdesign-icons-vue-next";
import {collapsed, toggleCollapsed} from "@/global/Constants.ts";

const router = useRouter();

const homePath = `/host/home`;
const credentialPath = `/host/credential`;

const value = ref(homePath);

const asideWidth = computed(() => {
  return collapsed.value ? '64px' : '232px';
})

const goBack = () => router.push("/home");

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
