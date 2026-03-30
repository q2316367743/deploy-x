<template>
  <t-layout class="release-asset-container">
    <t-aside class="asset-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">附件文件</span>
        <t-dropdown v-if="!readOnly" trigger="click">
          <t-button theme="primary" variant="text" size="small" shape="square">
            <template #icon>
              <add-icon/>
            </template>
          </t-button>
          <t-dropdown-menu>
            <t-dropdown-item @click="handleAddDocument">
              <template #prefix-icon>
                <file-word-icon/>
              </template>
              文档
            </t-dropdown-item>
            <t-dropdown-item @click="handleAddSql">
              <template #prefix-icon>
                <file-code-icon/>
              </template>
              SQL
            </t-dropdown-item>
            <t-dropdown-item @click="handleAddOther">
              <template #prefix-icon>
                <file-icon/>
              </template>
              其他
            </t-dropdown-item>
          </t-dropdown-menu>
        </t-dropdown>
      </div>
      <div class="sidebar-content">
        <release-asset-tree
          :nodes="treeMeta"
          :active-value="selectedId"
          @select="onSelect"
          @contextmenu="handleContextMenu"
        />
      </div>
    </t-aside>
    <t-content class="asset-content">
      <div v-if="selectedAsset" class="editor-wrapper">
        <div class="editor-header">
          <div class="header-left">
            <t-input
              v-model="selectedAsset.file_name"
              size="small"
              :borderless="true"
              @blur="handleRename"
            />
          </div>
          <div class="header-right">
            <t-button theme="primary" size="small" @click="handleSave">
              <template #icon>
                <save-icon/>
              </template>
              保存
            </t-button>
            <t-dropdown trigger="click">
              <t-button theme="default" variant="text" size="small">
                <template #icon>
                  <more-icon/>
                </template>
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item @click="handleDelete">
                  <template #prefix-icon>
                    <delete-icon/>
                  </template>
                  删除
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </div>
        <div class="editor-container">
          <markdown-editor
            v-if="selectedAsset.file_type === 'document'"
            v-model="editorContent"
          />
          <monaco-editor
            v-else
            v-model="editorContent"
            :language="editorLanguage"
            height="100%"
          />
        </div>
      </div>
      <div v-else class="empty-state">
        <t-icon name="file" size="48px"/>
        <p>选择一个文件开始编辑</p>
      </div>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import type {ReleaseAssetMeta, ReleaseAssetMetaScope} from "@/entity";
import {
  deleteReleaseAsset,
  getReleaseAssetContent,
  listReleaseAssetMeta,
  saveReleaseAsset,
  updateReleaseAsset,
} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {AddIcon, DeleteIcon, FileCodeIcon, FileIcon, FileWordIcon, MoreIcon, SaveIcon} from "tdesign-icons-vue-next";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";
import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue";
import {inferMonacoLanguageByFilename} from "@/modules/monaco";
import ReleaseAssetTree from "./ReleaseAssetTree.vue";
import {openReleaseAssetAdd} from "@/pages/project/table/func/ReleaseAssetEdit.tsx";
import {openReleaseAssetContextMenu} from "@/pages/project/table/func/ReleaseAssetContextMenu.tsx";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  scope: {
    type: String as PropType<ReleaseAssetMetaScope>,
    required: true,
  },
  scopeId: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    required: false,
    default: false
  }
});

interface AssetTreeNode {
  label: string;
  value: string;
  isLeaf?: boolean;
  type?: 'document' | 'sql' | 'other';
  children?: AssetTreeNode[];
  expanded?: boolean;
}

const items = ref<Array<ReleaseAssetMeta>>([]);
const selectedId = ref<string>('');
const selectedAsset = ref<ReleaseAssetMeta>();
const editorContent = ref('');
const editorLanguage = ref('plaintext');

const buildTree = (assets: Array<ReleaseAssetMeta>): AssetTreeNode[] => {
  const tree: AssetTreeNode[] = [];
  const nodeMap = new Map<string, AssetTreeNode>();

  assets.forEach(asset => {
    const folderPath = asset.relative_path || '';
    let parent: AssetTreeNode | null = null;

    if (folderPath) {
      const pathParts = folderPath.split('/');
      let currentPath = '';

      pathParts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const node: AssetTreeNode = {
            label: part,
            value: currentPath,
            isLeaf: false,
            children: [],
            expanded: true
          };

          nodeMap.set(currentPath, node);

          if (parent) {
            (parent as AssetTreeNode & { children: AssetTreeNode[] }).children.push(node);
          } else {
            tree.push(node);
          }
        }

        parent = nodeMap.get(currentPath)!;
      });
    }

    const fileNode: AssetTreeNode = {
      label: asset.file_name,
      value: asset.id,
      type: asset.file_type,
      isLeaf: true
    };

    if (parent) {
      (parent as AssetTreeNode & { children: AssetTreeNode[] }).children.push(fileNode);
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
};

const treeMeta = computed(() => {
  return buildTree(items.value);
});

const onSelect = (value: string) => {
  const asset = items.value.find(e => e.id === value);
  if (asset) {
    selectedAsset.value = asset;
    selectedId.value = value;
    loadAssetContent(asset);
  }
};

const handleContextMenu = async ({node, e}: { node: AssetTreeNode, e: PointerEvent }) => {
  if (props.readOnly) return;
  const asset = items.value.find(item => item.id === node.value);
  if (!asset) return;

  await openReleaseAssetContextMenu(asset, e, {
    onDelete: () => {
      items.value = items.value.filter(item => item.id !== asset.id);
      if (selectedAsset.value?.id === asset.id) {
        selectedAsset.value = undefined;
        selectedId.value = '';
        editorContent.value = '';
      }
    },
    onRename: () => {
      loadAssets();
    }
  });
};

const loadAssetContent = async (asset: ReleaseAssetMeta) => {
  try {
    const content = await getReleaseAssetContent(asset.id);
    if (content) {
      editorContent.value = content.content;
      if (asset.file_type === 'other') {
        editorLanguage.value = content.language || inferMonacoLanguageByFilename(asset.file_name);
      } else if (asset.file_type === 'sql') {
        editorLanguage.value = 'sql';
      }
    }
  } catch (error) {
    MessageUtil.error("加载附件内容失败", error);
  }
};

const handleSave = async () => {
  if (!selectedAsset.value) return;

  try {
    await saveReleaseAsset(selectedAsset.value.id, {
      content: editorContent.value,
      language: editorLanguage.value
    });
    MessageUtil.success("保存成功");
  } catch (error) {
    MessageUtil.error("保存失败", error);
  }
};

const handleRename = async () => {
  if (!selectedAsset.value) return;

  try {
    await updateReleaseAsset(selectedAsset.value.id, {
      file_name: selectedAsset.value.file_name,
      relative_path: selectedAsset.value.relative_path,
      file_type: selectedAsset.value.file_type
    });
  } catch (error) {
    MessageUtil.error("重命名失败", error);
  }
};

const handleDelete = async () => {
  if (!selectedAsset.value) return;

  try {
    await deleteReleaseAsset(selectedAsset.value.id);
    selectedAsset.value = undefined;
    selectedId.value = '';
    editorContent.value = '';
    items.value = items.value.filter(e => e.id !== selectedAsset.value?.id);
    MessageUtil.success("删除成功");
    await loadAssets();
  } catch (error) {
    MessageUtil.error("删除失败", error);
  }
};

const loadAssets = async () => {
  try {
    items.value = await listReleaseAssetMeta(props.projectId, props.scope, props.scopeId);
  } catch (error) {
    MessageUtil.error("获取物料异常", error);
  }
};

const handleAddDocument = () => {
  openReleaseAssetAdd({
    projectId: props.projectId,
    scope: props.scope,
    scopeId: props.scopeId,
    fileType: 'document',
    onUpdate: loadAssets
  })
};

const handleAddSql = () => {
  openReleaseAssetAdd({
    projectId: props.projectId,
    scope: props.scope,
    scopeId: props.scopeId,
    fileType: 'sql',
    onUpdate: loadAssets
  })
};

const handleAddOther = () => {
  openReleaseAssetAdd({
    projectId: props.projectId,
    scope: props.scope,
    scopeId: props.scopeId,
    fileType: 'other',
    onUpdate: loadAssets
  })
};

onMounted(() => {
  loadAssets();
});
</script>
<style scoped lang="less">
.release-asset-container {
  height: 100%;
  overflow: hidden;
  background: var(--td-bg-color-page);

  .asset-sidebar {
    width: 280px;
    border-right: 1px solid var(--td-border-level-1-color);
    display: flex;
    flex-direction: column;
    background: var(--td-bg-color-container);
    backdrop-filter: var(--fluent-acrylic-blur);
    box-shadow: var(--fluent-elevation-1);

    .sidebar-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--td-border-level-1-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--td-bg-color-container);

      .sidebar-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--td-text-color-primary);
      }
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      :deep(.t-tree) {
        background: transparent;
      }

      :deep(.t-tree__item) {
        border-radius: var(--td-radius-small);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: var(--td-bg-color-container-hover);
        }

        &.t-is-active {
          background: var(--td-brand-color-light);
          color: var(--td-brand-color);
        }
      }
    }
  }

  .asset-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .editor-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;

      .editor-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--td-border-level-1-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--td-bg-color-container);
        backdrop-filter: var(--fluent-acrylic-blur);

        .header-left {
          flex: 1;
        }

        .header-right {
          display: flex;
          gap: 8px;
        }
      }

      .editor-container {
        flex: 1;
        overflow: hidden;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--td-text-color-secondary);
      gap: 16px;

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }
}
</style>
