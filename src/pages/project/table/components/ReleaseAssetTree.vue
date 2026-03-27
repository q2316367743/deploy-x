<template>
  <div class="release-asset-tree-container">
    <div
      v-for="node in nodes"
      :key="node.value"
      class="tree-node"
      :style="{ paddingLeft: level * 20 + 'px' }"
    >
      <div
        :class="{
          'tree-item': true,
          'folder-item': !node.isLeaf,
          'file-item': node.isLeaf,
          'active': activeValue === node.value
        }"
        @click="handleClick(node)"
        @contextmenu.stop="handleContextMenu(node, $event)"
      >
        <div class="item-content">
          <template v-if="!node.isLeaf">
            <folder-open-icon v-if="node.expanded" class="item-icon folder-icon-color"/>
            <folder-icon v-else class="item-icon folder-icon-color"/>
            <span class="item-text">{{ node.label }}</span>
          </template>
          <template v-else>
            <file-icon class="item-icon file-icon-color"/>
            <span class="item-text">{{ node.label }}</span>
          </template>
        </div>
      </div>
      <release-asset-tree
        v-if="!node.isLeaf && node.expanded && node.children"
        :nodes="node.children"
        :level="level + 1"
        :active-value="activeValue"
        @select="$emit('select', $event)"
        @contextmenu="$emit('contextmenu', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FolderIcon, FolderOpenIcon, FileIcon} from "tdesign-icons-vue-next";

interface TreeNode {
  label: string;
  value: string;
  isLeaf?: boolean;
  type?: 'document' | 'sql' | 'other';
  children?: TreeNode[];
  expanded?: boolean;
}

interface Props {
  nodes: TreeNode[];
  level?: number;
  activeValue?: string;
}

const {level = 0, activeValue = ''} = defineProps<Props>();

const emit = defineEmits(['select', 'contextmenu']);

const toggleExpand = (node: TreeNode) => {
  if (!node.isLeaf) {
    node.expanded = !node.expanded;
  }
};

const handleClick = (node: TreeNode) => {
  if (node.isLeaf) {
    emit('select', node.value);
  } else {
    toggleExpand(node);
  }
};

const handleContextMenu = (node: TreeNode, e: PointerEvent) => {
  if (node.isLeaf) {
    emit('contextmenu', {node, e});
  }
};
</script>

<style scoped lang="less">
.release-asset-tree-container {
  .tree-node {
    margin-bottom: 2px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: var(--td-radius-small);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: var(--td-bg-color-container-hover);
    }

    &.active {
      background: var(--td-brand-color-light);
      color: var(--td-brand-color);
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;

      .item-icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;

        &.folder-icon-color {
          color: var(--td-warning-color-5);
        }

        &.file-icon-color {
          color: var(--td-brand-color-5);
        }
      }

      .item-text {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .folder-item {
    .item-text {
      font-weight: 600;
    }
  }
}
</style>
