<template>
  <div class="home-container">
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="logo-wrapper">
          <img src="/logo.png" :alt="APP_NAME" class="logo"/>
        </div>
        <div class="title-group">
          <h1 class="app-title">
            <span>{{ APP_NAME }}</span>
            <span class="font-size-16px ml-16px">
            <t-tag theme="warning" >v{{ APP_VERSION }}</t-tag>
            </span>
          </h1>
          <p class="app-subtitle">{{ APP_DESC }}</p>
        </div>
        <div class="mr-24px">
          <ShangZanBtn @click="openSz()"/>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="action-section">
        <div class="section-header">
          <h2 class="section-title">快速开始</h2>
          <p class="section-desc">创建您的第一个发版项目</p>
        </div>

        <div class="action-cards">
          <div class="action-card primary-action" @click="openReleaseProjectDialog(handleList)">
            <div class="card-icon">
              <add-icon/>
            </div>
            <div class="card-content">
              <h3 class="card-title">新增项目</h3>
              <p class="card-desc">创建一个新的发版项目，开始管理您的应用发布流程</p>
            </div>
            <div class="card-arrow">
              <chevron-right-icon/>
            </div>
          </div>

          <div class="action-card primary-action" @click="handleHostClick()">
            <div class="card-icon">
              <desktop-icon/>
            </div>
            <div class="card-content">
              <h3 class="card-title">主机管理</h3>
              <p class="card-desc">管理您的服务器主机，配置部署环境</p>
            </div>
            <div class="card-arrow">
              <chevron-right-icon/>
            </div>
          </div>
        </div>
      </div>

      <div class="projects-section" v-if="list.length > 0">
        <div class="section-header">
          <h2 class="section-title">我的项目</h2>
          <span class="project-count">{{ list.length }} 个项目</span>
        </div>

        <div class="projects-grid">
          <div
            v-for="item in list"
            :key="item.id"
            class="project-card"
            @click="handleProjectSelect(item)"
            @contextmenu="openReleaseProjectCxt($event, item, onUpdate)"
          >
            <div class="project-header">
              <div class="project-icon">
                <folder-icon/>
              </div>
            </div>
            <div class="project-body">
              <h3 class="project-name">{{ item.name }}</h3>
              <p class="project-desc">{{ item.desc || '暂无描述' }}</p>
            </div>
            <div class="project-footer">
              <span class="project-time">
                <time-icon/>
                {{ formatTime(item.updated_at) }}
              </span>
            </div>
            <div class="project-action">
              <t-button theme="primary" shape="square" variant="text"
                        @click="openReleaseProjectCxt($event, item, onUpdate)">
                <template #icon>
                  <more-icon/>
                </template>
              </t-button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-section" v-else>
        <div class="empty-content">
          <div class="empty-icon">
            <folder-open-icon/>
          </div>
          <h3 class="empty-title">还没有项目</h3>
          <p class="empty-desc">点击上方"新增项目"按钮创建您的第一个发版项目</p>
        </div>
      </div>
    </div>

    <div class="welcome-tag">
      <div class="github-link">
        <user-icon/>
        {{ APP_AUTHOR }}
      </div>
      <a :href="APP_GITHUB" target="_blank" class="github-link">
        <logo-github-icon/>
        GitHub
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AddIcon,
  ChevronRightIcon,
  FolderIcon,
  TimeIcon,
  FolderOpenIcon,
  MoreIcon,
  DesktopIcon,
  LogoGithubIcon, UserIcon
} from "tdesign-icons-vue-next";
import type {ReleaseProject} from "@/entity";
import {listReleaseProject} from "@/service";
import {
  openReleaseProjectCxt,
  openReleaseProjectDialog
} from "./func/ReleaseProjectEdit.tsx";
import dayjs from 'dayjs';
import ShangZanBtn from "@/pages/home/components/ShangZanBtn.vue";
import {openSz} from "@/pages/home/func/OpenSz.tsx";
import {APP_AUTHOR, APP_DESC, APP_GITHUB, APP_NAME, APP_VERSION} from "@/global/Constants.ts";

const router = useRouter();

const list = ref(new Array<ReleaseProject>());

const handleList = async () => {
  list.value = await listReleaseProject();
};

const handleProjectSelect = (item: ReleaseProject) => {
  router.push(`/release/${item.id}/home`);
};
const handleHostClick = () => {
  router.push('/host/home');
}

const onUpdate = () => {
  handleList();
};

const formatTime = (time: string | number) => {
  if (!time) return '未知';
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

tryOnMounted(handleList);
</script>

<style scoped lang="less">
@import "less/home.less";
</style>
