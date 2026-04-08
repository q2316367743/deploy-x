<template>
  <div v-if="init" class="pvm-log">
    <wd-cell-group title="版本日志">
      <template #actions>
        <t-button theme="primary" size="small" @click="handleAdd">
          添加日志
        </t-button>
      </template>

      <div v-if="content.length === 0" class="empty-log">
        <t-empty title="暂无版本日志" description="点击上方按钮添加日志"/>
      </div>

      <div v-else class="log-list">
        <div v-for="(item, index) in content" :key="index" class="log-item">
          <t-select
            v-model="item.type"
            :options="typeOptions"
            class="type-select"
          />
          <t-input
            v-model="item.content"
            placeholder="请输入日志内容"
            class="log-content-input"
          />
          <t-button
            variant="text"
            theme="danger"
            size="small"
            @click="handleDelete(index)"
          >
            删除
          </t-button>
        </div>
      </div>
    </wd-cell-group>

    <div v-if="content.length > 0" class="save-bar">
      <t-button theme="primary" @click="handleSave" :loading="saving">
        保存日志
      </t-button>
    </div>
  </div>
  <loading-result v-else/>
</template>
<script lang="ts" setup>
import {getReleaseVersionLog, saveReleaseVersionLog} from "@/service";
import {VersionLogTypeText, type VersionLogContent, type VersionLogType} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  versionId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
});

const init = ref(false);
const saving = ref(false);
const content = ref<Array<VersionLogContent>>([]);

const typeOptions = computed(() => {
  return Object.entries(VersionLogTypeText).map(([value, label]) => ({
    label,
    value: Number(value) as VersionLogType
  }));
});

const handleAdd = () => {
  content.value.push({
    type: 1 as VersionLogType,
    content: ''
  });
};

const handleDelete = (index: number) => {
  content.value.splice(index, 1);
};

const handleSave = async () => {
  const validContent = content.value.filter(item => item.content.trim());
  if (validContent.length === 0) {
    MessageUtil.warning("请至少添加一条有效的日志内容");
    return;
  }

  saving.value = true;
  try {
    await saveReleaseVersionLog(props.versionId, validContent);
    content.value = validContent;
    MessageUtil.success("保存成功");
  } catch (e) {
    MessageUtil.error("保存失败", e);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await getReleaseVersionLog(props.versionId);
    content.value = res?.content || [];
  } finally {
    init.value = true;
  }
});
</script>
<style scoped lang="less">
.pvm-log {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-log {
  padding: 24px;
}

.log-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-default);
  border: 1px solid var(--td-border-level-1-color);

  .type-select {
    flex-shrink: 0;
    width: 100px;
  }

  .log-content-input {
    flex: 1;
    min-width: 0;
  }
}

.save-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0 8px;
}
</style>
