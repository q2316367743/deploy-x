<template>
  <div class="version-log-list">
    <div v-if="logs.length === 0" class="my-16px">
      <t-empty title="暂无版本日志"/>
    </div>
    <div v-for="log in logs" :key="log.id" class="version-log-item">
      <div class="version-log-title">
        <div class="version-log-title-text">
          {{ log.version }}
        </div>
        <div class="version-log-title-divider">—</div>
        <div class="version-log-title-date">
          {{ formatDatetime(log.publish_time) }}
        </div>
      </div>
      <div class="version-log-content">
        <div v-for="(item, i) in log.content" :key="i" class="version-log-content-item">
          <div class="label" :style="VersionLogTypeColor[item.type]">{{ VersionLogTypeText[item.type] }}</div>
          <div class="ml-8px">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {listReleaseVersionLog, type ReleaseVersionWithLog} from "@/service";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";
import {VersionLogTypeColor, VersionLogTypeText} from "@/entity";

const props = defineProps({
  versionIds: {
    type: Object as PropType<Array<string>>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: []
  }
});

const logs = computedAsync<Array<ReleaseVersionWithLog>>(async () => {
  const list = await listReleaseVersionLog(props.versionIds)
  return list.filter(e => e.content.length > 0);
}, [])
</script>
<style scoped lang="less">
.version-log-list {
  padding: 8px;

  .version-log-item {
    margin-bottom: 16px;
    padding-left: 16px;
    border-left: 5px solid var(--td-brand-color-8);

    &:last-child {
      margin-bottom: 0;
    }

    .version-log-title {
      display: flex;
      align-items: center;
      color: var(--td-brand-color);
      font-weight: 500;

      .version-log-title-divider {
        margin: 0 8px;
      }
    }

    .version-log-content {
      margin-top: 4px;
      padding-bottom: 4px;

      .version-log-content-item {
        display: flex;
        margin-bottom: 4px;
        .label {
          padding-left: 4px;
          padding-right: 4px;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
