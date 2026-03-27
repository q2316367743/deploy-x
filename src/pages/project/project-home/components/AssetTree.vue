<template>
  <div class="asset-tree-container">
    <div class="tree-content">
      <t-tree
        :data="treeData"
        :active-multiple="false"
        :expand-all="true"
        :activable="true"
        hover
        :actived="selectedId ? [selectedId] : []"
        @active="onSelect"
      >
        <template #label="{ node }">
          <div class="tree-node-label">
            <file-word-icon v-if="node.data.type === 'document'"/>
            <file-code-icon v-else-if="node.data.type === 'sql'"/>
            <file-icon v-else-if="node.data.type === 'other'"/>
            <folder-icon v-else/>
            <span>{{ node.label }}</span>
          </div>
        </template>
      </t-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ReleaseAssetMeta} from "@/entity";
import {FileCodeIcon, FileIcon, FileWordIcon, FolderIcon} from "tdesign-icons-vue-next";

interface Props {
  assets: Array<ReleaseAssetMeta>;
  selectedId: string;
  versionAssets?: Map<string, { version: string; assets: Array<ReleaseAssetMeta> }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedId': [value: string];
}>();

interface TreeNode {
  label: string;
  value: string;
  type?: 'document' | 'sql' | 'other' | 'folder' | 'version';
  children?: TreeNode[];
}

const buildTree = (assets: Array<ReleaseAssetMeta>, versionAssets?: Map<string, {
  version: string;
  assets: Array<ReleaseAssetMeta>
}>): TreeNode[] => {
  if (versionAssets && versionAssets.size > 0) {
    const tree: TreeNode[] = [];

    versionAssets.forEach((data, versionId) => {
      const versionNode: TreeNode = {
        label: data.version,
        value: `version-${versionId}`,
        type: 'version',
        children: buildAssetTree(data.assets)
      };
      tree.push(versionNode);
    });

    return tree;
  }

  return buildAssetTree(assets);
};

const buildAssetTree = (assets: Array<ReleaseAssetMeta>): TreeNode[] => {
  const tree: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  assets.forEach(asset => {
    const folderPath = asset.relative_path || '';
    let parent: TreeNode | undefined = undefined;

    if (folderPath) {
      const pathParts = folderPath.split('/');
      let currentPath = '';

      pathParts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const node: TreeNode = {
            label: part,
            value: currentPath,
            type: 'folder',
            children: []
          };

          nodeMap.set(currentPath, node);

          if (parent) {
            (parent as TreeNode & { children: TreeNode[] }).children.push(node);
          } else {
            tree.push(node);
          }
        }

        parent = nodeMap.get(currentPath);
      });
    }

    const fileNode: TreeNode = {
      label: asset.file_name,
      value: asset.id,
      type: asset.file_type
    };

    if (parent) {
      (parent as TreeNode & { children: TreeNode[] }).children.push(fileNode);
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
};

const treeData = computed(() => buildTree(props.assets, props.versionAssets));

const onSelect = (value: Array<string | number>) => {
  if (value.length > 0) {
    const id = String(value[0]);
    emit('update:selectedId', id);
  }
};
</script>

<style scoped lang="less">
.asset-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--td-bg-color-container);

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    :deep(.t-tree) {
      background: transparent;
    }

    :deep(.t-tree__item) {
      border-radius: var(--td-radius-small);
      transition: all var(--fluent-transition-fast);

      &:hover {
        background: var(--td-bg-color-container-hover);
      }

      &.t-is-active {
        background: var(--td-brand-color-light);
        color: var(--td-brand-color);
      }
    }

    .tree-node-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
