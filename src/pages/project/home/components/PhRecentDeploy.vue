<template>
  <t-card title="最近部署" subtitle="最近 10 条记录" :bordered="false">
    <t-list v-if="!loading" split size="small">
      <t-list-item v-for="item in deployList" :key="item.id">
        <t-list-item-meta :title="item.version" :description="item.instance_name">
        </t-list-item-meta>
        <template #action>
          <div class="deploy-info">
            <span class="deploy-user">{{ item.deploy_user }}</span>
            <span class="deploy-time">{{ formatDatetime(item.deploy_time) }}</span>
          </div>
        </template>
      </t-list-item>
      <t-list-item v-if="deployList.length === 0">
        <t-list-item-meta title="暂无部署记录" description="还没有任何部署操作" />
      </t-list-item>
    </t-list>
    <div v-else class="loading-placeholder">
      <t-loading text="加载中..." />
    </div>
  </t-card>
</template>

<script lang="ts" setup>
import { deployVersionInstance, type DeployVersionInstance } from '@/service/statistics';
import MessageUtil from '@/util/model/MessageUtil';
import {formatDatetime} from "@/util/lang/FormatUtil.ts";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const deployList = ref<Array<DeployVersionInstance>>([]);

const loadData = async () => {
  try {
    loading.value = true;
    deployList.value = await deployVersionInstance(props.projectId);
  } catch (e) {
    MessageUtil.error('获取最近部署记录失败', e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped lang="less">
.deploy-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .avatar-text {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
}

.deploy-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  .deploy-user {
    font-size: 12px;
    color: var(--td-text-color-primary);
    font-weight: 500;
  }

  .deploy-time {
    font-size: 11px;
    color: var(--td-text-color-secondary);
  }
}

.loading-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
