<template>
  <app-tool-layout title="主机列表">
    <template #action>
      <t-button theme="primary" @click="handleAdd">
        <template #icon>
          <add-icon/>
        </template>
        新增主机
      </t-button>
    </template>
    <main class="page-main">
      <div class="table-wrapper">
        <div class="table-header-bar">
          <div>
            <h3 class="table-title">主机列表</h3>
            <p class="table-hint">管理可部署的主机，支持密码、密钥和凭证三种认证方式</p>
          </div>
          <div class="header-actions">
            <t-input
              v-model="searchText"
              placeholder="搜索主机名称..."
              :style="{ width: '200px' }"
              clearable
            >
              <template #prefix-icon>
                <search-icon/>
              </template>
            </t-input>
          </div>
        </div>

        <t-table
          :data="hosts"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :hover="true"
          stripe
          size="medium"
        >
          <template #name="{ row }">
            <div class="host-name">
              <server-icon class="type-icon"/>
              <span>{{ row.name }}</span>
            </div>
          </template>
          <template #host-port="{ row }">
            <span class="host-port-text">{{ row.host }}:{{ row.port }}</span>
          </template>
          <template #auth_type="{ row }">
            <t-tag
              :theme="row.auth_type === 'password' ? 'success' : row.auth_type === 'secret' ? 'warning' : 'primary'"
              variant="light"
            >
              {{ row.auth_type === 'password' ? '密码认证' : row.auth_type === 'secret' ? '密钥认证' : '凭证认证' }}
            </t-tag>
          </template>
          <template #auth_user="{ row }">
            <span class="username-text">{{ row.auth_user }}</span>
          </template>
          <template #action="{ row }">
            <div class="action-cell">
              <t-link
                theme="primary"
                @click="handleEdit(row)"
              >
                编辑
              </t-link>
              <t-link
                theme="danger"
                @click="handleDelete(row)"
              >
                删除
              </t-link>
            </div>
          </template>
        </t-table>
      </div>
    </main>
  </app-tool-layout>
</template>

<script lang="ts" setup>
import type {Host} from "@/entity";
import {listHost} from "@/service";
import {addHomeHost, deleteHomeHost, updateHomeHost} from "@/pages/host/home/func.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {AddIcon, SearchIcon, ServerIcon} from "tdesign-icons-vue-next";
import type {PrimaryTableCol} from "tdesign-vue-next";

const loading = ref(false);
const hosts = ref<Host[]>([]);
const searchText = ref('');

const columns: Array<PrimaryTableCol> = [
  {colKey: 'name', title: '主机名称', width: 180, fixed: 'left'},
  {colKey: 'host-port', title: '地址:端口', width: 180},
  {colKey: 'auth_type', title: '认证方式', width: 120},
  {colKey: 'auth_user', title: '认证用户', width: 120},
  {colKey: 'action', title: '操作', width: 120, fixed: 'right'},
];

const loadData = async () => {
  loading.value = true;
  try {
    hosts.value = await listHost(searchText.value ? searchText.value : undefined);
  } catch (e) {
    MessageUtil.error("获取主机列表失败", e);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  addHomeHost(loadData);
};

const handleEdit = (row: Host) => {
  updateHomeHost(row, loadData);
};

const handleDelete = (row: Host) => {
  deleteHomeHost(row.id, loadData);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
.page-main {
  margin: 0 auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-wrapper {
  background: var(--fluent-card-bg);
  backdrop-filter: var(--fluent-acrylic-blur);
  border-radius: var(--fluent-radius-card);
  border: 1px solid var(--fluent-border-subtle);
  box-shadow: var(--fluent-elevation-2);
  overflow: hidden;
}

.table-header-bar {
  padding: 16px;
  border-bottom: 1px solid var(--fluent-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
}

.table-hint {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.host-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .type-icon {
    color: var(--td-text-color-secondary);
  }
}

.host-port-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.username-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.action-cell {
  display: flex;
  gap: 8px;
}
</style>
