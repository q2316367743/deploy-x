<template>
  <app-tool-layout title="凭证列表">
    <template #action>
      <t-button theme="primary" @click="handleAdd">
        <template #icon>
          <add-icon/>
        </template>
        新增凭证
      </t-button>
    </template>
    <main class="page-main">
      <div class="table-wrapper">
        <div class="table-header-bar">
          <div>
            <h3 class="table-title">凭证列表</h3>
            <p class="table-hint">管理主机连接凭证，支持密码和密钥两种方式</p>
          </div>
          <div class="header-actions">
            <t-input
              v-model="searchText"
              placeholder="搜索凭证名称..."
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
          :data="credentials"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :hover="true"
          stripe
          size="medium"
        >
          <template #name="{ row }">
            <div class="credential-name">
              <t-icon :name="row.type === 'password' ? 'lock-on' : 'key'" class="type-icon"/>
              <span>{{ row.name }}</span>
            </div>
          </template>
          <template #type="{ row }">
            <t-tag
              :theme="row.type === 'password' ? 'success' : 'warning'"
              variant="light"
            >
              {{ row.type === 'password' ? '密码凭证' : '密钥凭证' }}
            </t-tag>
          </template>
          <template #username="{ row }">
            <span class="username-text">{{ row.username }}</span>
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
import type {HostCredential} from "@/entity";
import {listHostCredential} from "@/service";
import {addHomeCredential, deleteHomeCredential, updateHomeCredential} from "@/pages/host/credential/func.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {AddIcon, SearchIcon} from "tdesign-icons-vue-next";
import type {PrimaryTableCol} from "tdesign-vue-next";

const loading = ref(false);
const credentials = ref<HostCredential[]>([]);
const searchText = ref('');

const columns: Array<PrimaryTableCol> = [
  {colKey: 'name', title: '凭证名称', width: 200, fixed: 'left'},
  {colKey: 'type', title: '类型', width: 120},
  {colKey: 'username', title: '用户名', width: 150},
  {colKey: 'action', title: '操作', width: 120, fixed: 'right'},
];

const loadData = async () => {
  loading.value = true;
  try {
    credentials.value = await listHostCredential(searchText.value ? searchText.value : undefined);
  } catch (e) {
    MessageUtil.error("获取凭证列表失败", e);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  addHomeCredential(loadData);
};

const handleEdit = (row: HostCredential) => {
  updateHomeCredential(row, loadData);
};

const handleDelete = (row: HostCredential) => {
  deleteHomeCredential(row.id, loadData);
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

.credential-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .type-icon {
    color: var(--td-text-color-secondary);
  }
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
