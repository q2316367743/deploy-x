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
          'file-item': true,
          'active': activeValue === node.value
        }"
        @click="handleClick(node)"
        @contextmenu.stop="handleContextMenu(node, $event)"
      >
        <div class="item-content">
          <textbox-icon v-if="node.type === 1"/>
          <file-code-icon v-else-if="node.type === 2"/>
          <file-icon v-else/>
          <span class="item-text">{{ node.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {FileCodeIcon, FileIcon, TextboxIcon} from "tdesign-icons-vue-next";
import type {ReleaseAssetListItemType} from "@/pages/project/components/asset/types.ts";

interface TreeNode {
  label: string;
  value: string;
  type: ReleaseAssetListItemType;
}

interface Props {
  nodes: TreeNode[];
  level?: number;
  activeValue?: string;
}

const {level = 0, activeValue = ''} = defineProps<Props>();

const emit = defineEmits(['select', 'contextmenu']);


const handleClick = (node: TreeNode) => {
  emit('select', node.value);
};

const handleContextMenu = (node: TreeNode, e: PointerEvent) => {
  emit('contextmenu', {node, e});
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
