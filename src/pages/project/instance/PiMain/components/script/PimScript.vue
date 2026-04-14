<template>
  <div class="pim-script">
    <div class="script-header">
      <div class="header-info">
        <h3 class="script-title">部署脚本</h3>
        <p class="script-hint">管理本地构建和远程部署脚本</p>
      </div>
      <div class="header-actions">
        <t-input
          v-model="searchText"
          placeholder="搜索脚本名称..."
          :style="{ width: '200px' }"
          clearable
        >
          <template #prefix-icon>
            <search-icon/>
          </template>
        </t-input>
        <t-button theme="primary" @click="handleAdd">
          <template #icon>
            <add-icon/>
          </template>
          新增脚本
        </t-button>
      </div>
    </div>

    <div class="script-grid" v-if="filteredScripts.length > 0">
      <div
        v-for="script in filteredScripts"
        :key="script.id"
        class="script-card"
      >
        <div class="card-header">
          <div class="card-title-row">
            <play-circle-icon class="card-icon"
                              :class="script.script_type === 'remote' ? 'icon-remote' : 'icon-local'"/>
            <span class="card-title">{{ script.name }}</span>
          </div>
          <t-tag
            :theme="script.script_type === 'remote' ? 'warning' : 'success'"
            variant="light"
            size="small"
          >
            {{ script.script_type === 'remote' ? '远程部署' : '本地构建' }}
          </t-tag>
        </div>

        <div class="card-body">
          <p class="card-description">{{ script.description || '暂无描述' }}</p>
          <div class="card-meta" v-if="script.local_work_dir">
            <folder-1-icon class="meta-icon"/>
            <span class="meta-text">{{ script.local_work_dir }}</span>
          </div>
          <div class="card-meta" v-if="script.target_dir">
            <link-unlink-icon class="meta-icon"/>
            <span class="meta-text">{{ script.target_dir }}</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="card-time">{{ formatTime(script.updated_at) }}</span>
          <div class="card-actions">
            <t-link theme="success" @click.stop="handleExecute(script)">执行</t-link>
            <t-link theme="warning" @click.stop="openDeployRecordDrawer(script.id)">记录</t-link>
            <t-link theme="primary" @click.stop="handleEdit(script)">编辑</t-link>
            <t-link theme="danger" @click.stop="handleDelete(script)">删除</t-link>
          </div>
        </div>
      </div>
    </div>

    <t-empty
      v-else
      description="暂无部署脚本，请添加"
      :style="{ padding: '48px 0' }"
    />
  </div>
</template>

<script lang="ts" setup>
import {type DeployScriptList} from "@/entity/deploy/DeployScript.ts";
import {listDeployScript} from "@/service/deploy/DeployScriptService.ts";
import {addScript, deleteScript, updateScript} from "./PimScriptFunc.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {AddIcon, Folder1Icon, LinkUnlinkIcon, PlayCircleIcon, SearchIcon} from "tdesign-icons-vue-next";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";
import {openDeployRecordDrawer} from "@/pages/project/components/deploy/DeployRecordDrawer.tsx";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {deployInvoke} from "@/modules/deploy";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  instanceId: {
    type: String,
    required: true,
  }
});

const loading = ref(false);
const scripts = ref<DeployScriptList[]>([]);
const searchText = ref('');

const filteredScripts = computed(() => {
  if (!searchText.value) return scripts.value;
  const keyword = searchText.value.toLowerCase();
  return scripts.value.filter(s => s.name.toLowerCase().includes(keyword));
});

const formatTime = (timestamp: number) => {
  return formatDatetime(timestamp);
};

const loadData = async () => {
  loading.value = true;
  try {
    scripts.value = await listDeployScript(props.projectId, props.instanceId);
  } catch (e) {
    MessageUtil.error("获取脚本列表失败", e);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  addScript(props.projectId, props.instanceId, loadData);
};

const handleEdit = (row: DeployScriptList) => {
  updateScript(row, loadData);
};

const handleDelete = (row: DeployScriptList) => {
  deleteScript(row.id, loadData);
};

const handleExecute = (row: DeployScriptList) => {
  MessageBoxUtil.confirm("是否执行脚本", "执行脚本").then(() => {
    deployInvoke(row.id);
  })
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="less">
@import "PimScript.less";
</style>
