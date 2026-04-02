<template>
  <div class="version-log-list">
    <div v-if="logs.length === 0" class="my-16px">
      <t-empty title="暂无版本日志"/>
    </div>
    <div v-for="log in logs" :key="log.id" class="version-log-item">
      <VersionTitle v-if="showTitle" :version="log"/>
      <div v-if="log.content.length > 0" class="version-log-content">
        <div v-for="(item, i) in log.content" :key="i" class="version-log-content-item">
          <div class="label" :style="VersionLogTypeColor[item.type]">{{ VersionLogTypeText[item.type] }}</div>
          <div class="ml-8px">{{ item.content }}</div>
        </div>
      </div>
      <t-divider v-else-if="showTitle">暂无更新日志</t-divider>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {listReleaseVersionLog, type ReleaseVersionWithLog} from "@/service";
import {VersionLogTypeColor, VersionLogTypeText} from "@/entity";
import VersionTitle from "@/pages/project/components/VersionTitle.vue";
import {writeText} from "@tauri-apps/plugin-clipboard-manager";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {formatDate} from "@vueuse/core";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";

const props = defineProps({
  versionIds: {
    type: Object as PropType<Array<string>>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: []
  },
  showTitle: {
    type: Boolean,
    default: true
  }
});

const logs = computedAsync<Array<ReleaseVersionWithLog>>(async () => {
  const list = await listReleaseVersionLog(props.versionIds)
  return list.filter(e => e.content.length > 0);
}, []);

defineExpose({
  copyAll: () => {
    const content = logs.value.map(e => {
      const l = [
        `## ${e.version}`,
        '',
        `> 部署时间：${formatDatetime(e.publish_time)}`,
      ];
      if (e.publish_user) {
        l.push('> ', `> 部 署 人：${e.publish_user}`);
      }
      l.push('', ...e.content.map(l => `- \`${VersionLogTypeText[l.type]}\` ${l.content}`));
      return l.join('\n');
    }).join("\n\n\n");
    writeText(content).then(() => {
      MessageUtil.success("复制成功");
    }).catch(e => {
      MessageUtil.error("复制失败", e);
    })
  }
})
</script>
<style scoped lang="less">
.version-log-list {
  padding: 8px;

  .version-log-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .version-log-content {
      margin-top: 8px;
      padding-bottom: 4px;

      .version-log-content-item {
        display: flex;
        margin-bottom: 4px;

        .label {
          padding-left: 4px;
          padding-right: 4px;
          border-radius: 4px;
          width: 32px;
          height: 22px;
          flex-shrink: 0;
          text-align: center;
        }
      }
    }
  }
}
</style>
