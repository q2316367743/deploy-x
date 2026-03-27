<template>
  <div class="version-timeline">
    <div v-for="version in versions" :key="version.id" class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="version-header">
          <div class="version-info">
            <span class="version-tag">{{ version.version }}</span>
            <span class="version-time">{{ formatTime(version.publish_time) }}</span>
          </div>
          <div class="version-user">{{ version.publish_user }}</div>
        </div>
        <div v-if="logMap.get(version.id)" class="log-content">
          <markdown-preview :content="logMap.get(version.id)!.content"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ReleaseVersion,ReleaseVersionLog} from "@/entity";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";

interface Props {
  versions: Array<ReleaseVersion>;
  logMap: Map<string, ReleaseVersionLog>;
}

defineProps<Props>();

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped lang="less">
.version-timeline {
  padding: 16px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--td-border-level-2-color);
  }

  .timeline-item {
    position: relative;
    padding-left: 48px;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .timeline-dot {
      position: absolute;
      left: 8px;
      top: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--td-brand-color);
      border: 3px solid var(--td-bg-color-container);
      box-shadow: 0 0 0 2px var(--td-brand-color);
      z-index: 1;
    }

    .timeline-content {
      background: var(--fluent-card-bg);
      border: 1px solid var(--fluent-card-border);
      border-radius: var(--fluent-radius-card);
      box-shadow: var(--fluent-card-shadow);
      overflow: hidden;
      transition: all var(--fluent-transition-normal);

      &:hover {
        box-shadow: var(--fluent-card-shadow-hover);
        transform: translateY(-2px);
      }

      .version-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--fluent-card-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--td-bg-color-container);

        .version-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .version-tag {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            background: var(--td-brand-color-light);
            color: var(--td-brand-color);
            border-radius: var(--td-radius-small);
            font-size: 14px;
            font-weight: 600;
          }

          .version-time {
            font-size: 13px;
            color: var(--td-text-color-secondary);
          }
        }

        .version-user {
          font-size: 13px;
          color: var(--td-text-color-secondary);
        }
      }

      .log-content {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
        background: var(--td-bg-color-page);
      }
    }
  }
}
</style>
