<template>
  <div class="home-container">
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="logo-wrapper">
          <img src="/logo.png" alt="发版助手" class="logo" />
        </div>
        <div class="title-group">
          <h1 class="app-title">发版助手</h1>
          <p class="app-subtitle">高效管理您的项目发布流程</p>
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
              <add-icon />
            </div>
            <div class="card-content">
              <h3 class="card-title">新增项目</h3>
              <p class="card-desc">创建一个新的发版项目，开始管理您的应用发布流程</p>
            </div>
            <div class="card-arrow">
              <chevron-right-icon />
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
            @click="handleSelect(item)"
            @contextmenu="openReleaseProjectCxt($event, item, onUpdate)"
          >
            <div class="project-header">
              <div class="project-icon">
                <folder-icon />
              </div>
            </div>
            <div class="project-body">
              <h3 class="project-name">{{ item.name }}</h3>
              <p class="project-desc">{{ item.desc || '暂无描述' }}</p>
            </div>
            <div class="project-footer">
              <span class="project-time">
                <time-icon />
                {{ formatTime(item.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-section" v-else>
        <div class="empty-content">
          <div class="empty-icon">
            <folder-open-icon />
          </div>
          <h3 class="empty-title">还没有项目</h3>
          <p class="empty-desc">点击上方"新增项目"按钮创建您的第一个发版项目</p>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <div class="tip-card">
        <div class="tip-icon">
          <lightbulb-icon />
        </div>
        <div class="tip-content">
          <h4 class="tip-title">使用提示</h4>
          <ul class="tip-list">
            <li>右键点击项目卡片可进行编辑、删除等操作</li>
            <li>点击项目卡片进入项目详情，管理版本和实例</li>
            <li>支持多项目管理，轻松切换不同的发版流程</li>
          </ul>
        </div>
      </div>
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
  LightbulbIcon
} from "tdesign-icons-vue-next";
import type { ReleaseProject } from "@/entity";
import { listReleaseProject } from "@/service";
import { 
  openReleaseProjectCxt, 
  openReleaseProjectDialog 
} from "./func/ReleaseProjectEdit.tsx";
import dayjs from 'dayjs';
import ShangZanBtn from "@/pages/home/ShangZanBtn.vue";
import {openSz} from "@/pages/home/func/OpenSz.tsx";

const router = useRouter();

const list = ref(new Array<ReleaseProject>());

const handleList = async () => {
  list.value = await listReleaseProject();
};

const handleSelect = (item: ReleaseProject) => {
  router.push(`/release/${item.id}/home`);
};

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
.home-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-page);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.welcome-section {
  background: var(--fluent-gradient-primary);
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
    pointer-events: none;
  }

  .welcome-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .logo-wrapper {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--fluent-radius-card);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    padding: 10px;

    .logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .title-group {
    flex: 1;
  }

  .app-title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .app-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-weight: 400;
  }
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: calc(100% - 48px);
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  .section-desc {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    margin: 2px 0 0 0;
  }

  .project-count {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    background: var(--fluent-item-hover);
    padding: 3px 10px;
    border-radius: 10px;
  }
}

.action-section {
  .action-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .action-card {
    background: var(--fluent-card-bg);
    border: 1px solid var(--fluent-card-border);
    border-radius: var(--fluent-radius-smooth);
    padding: 16px 20px;
    cursor: pointer;
    transition: all var(--fluent-transition-normal);
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: var(--fluent-acrylic-blur);
    box-shadow: var(--fluent-card-shadow);

    &:hover {
      background: var(--fluent-card-bg-hover);
      box-shadow: var(--fluent-card-shadow-hover);
      transform: translateY(-2px);
      border-color: var(--fluent-accent-color);
    }

    &.primary-action {
      background: linear-gradient(135deg, var(--fluent-accent-color) 0%, #106ebe 100%);
      border: none;

      .card-icon {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      .card-title {
        color: #ffffff;
      }

      .card-desc {
        color: rgba(255, 255, 255, 0.9);
      }

      .card-arrow {
        color: rgba(255, 255, 255, 0.8);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 120, 212, 0.3);
      }
    }

    .card-icon {
      width: 40px;
      height: 40px;
      background: var(--fluent-accent-light);
      border-radius: var(--fluent-radius-smooth);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: var(--fluent-accent-color);
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 0 0 2px 0;
    }

    .card-desc {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .card-arrow {
      font-size: 18px;
      color: var(--td-text-color-secondary);
      flex-shrink: 0;
    }
  }
}

.projects-section {
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }

  .project-card {
    background: var(--fluent-card-bg);
    border: 1px solid var(--fluent-card-border);
    border-radius: var(--fluent-radius-smooth);
    padding: 16px;
    cursor: pointer;
    transition: all var(--fluent-transition-normal);
    backdrop-filter: var(--fluent-acrylic-blur);
    box-shadow: var(--fluent-card-shadow);

    &:hover {
      background: var(--fluent-card-bg-hover);
      box-shadow: var(--fluent-card-shadow-hover);
      transform: translateY(-2px);
      border-color: var(--fluent-accent-color);
    }

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .project-icon {
      width: 36px;
      height: 36px;
      background: var(--fluent-accent-light);
      border-radius: var(--fluent-radius-smooth);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: var(--fluent-accent-color);
    }


    .project-body {
      margin-bottom: 12px;
    }

    .project-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 0 0 6px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-desc {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      margin: 0;
      line-height: 1.4;
      height: 34px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .project-footer {
      display: flex;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--fluent-border-subtle);
    }

    .project-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--td-text-color-secondary);
    }
  }
}

.empty-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;

  .empty-content {
    text-align: center;
    max-width: 360px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    background: var(--fluent-item-hover);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 32px;
    color: var(--td-text-color-secondary);
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px 0;
  }

  .empty-desc {
    font-size: 13px;
    color: var(--td-text-color-secondary);
    margin: 0;
    line-height: 1.5;
  }
}

.tips-section {
  max-width: 1200px;
  width: calc(100% - 48px);
  margin: 0 auto;
  padding: 0 24px 24px;
  box-sizing: border-box;

  .tip-card {
    background: var(--fluent-card-bg);
    border: 1px solid var(--fluent-card-border);
    border-radius: var(--fluent-radius-smooth);
    padding: 16px 20px;
    display: flex;
    gap: 12px;
    backdrop-filter: var(--fluent-acrylic-blur);
    box-shadow: var(--fluent-card-shadow);
  }

  .tip-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #ffb900 0%, #ff8c00 100%);
    border-radius: var(--fluent-radius-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #ffffff;
    flex-shrink: 0;
  }

  .tip-content {
    flex: 1;

    .tip-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 0 0 8px 0;
    }

    .tip-list {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        font-size: 12px;
        color: var(--td-text-color-secondary);
        line-height: 1.6;
        padding-left: 14px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 3px;
          height: 3px;
          background: var(--fluent-accent-color);
          border-radius: 50%;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 24px 16px;

    .welcome-content {
      flex-direction: column;
      text-align: center;
    }

    .app-title {
      font-size: 20px;
    }

    .app-subtitle {
      font-size: 13px;
    }
  }

  .main-content {
    padding: 16px;
  }

  .action-section .action-cards {
    grid-template-columns: 1fr;
  }

  .projects-section .projects-grid {
    grid-template-columns: 1fr;
  }

  .tips-section {
    padding: 0 16px 16px;
  }
}
</style>
