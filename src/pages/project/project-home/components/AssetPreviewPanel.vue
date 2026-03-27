<template>
  <div class="asset-preview-panel">
    <div class="asset-sidebar">
      <AssetTree
        :assets="assets"
        :version-assets="versionAssets"
        :selected-id="selectedId"
        @update:selected-id="onSelect"
      />
    </div>
    <div class="asset-main">
      <AssetPreview
        :assets="assets"
        :selected-id="selectedId"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ReleaseAssetMeta} from "@/entity";
import AssetTree from "@/pages/project/project-home/components/AssetTree.vue";
import AssetPreview from "@/pages/project/project-home/components/AssetPreview.vue";

interface Props {
  assets: Array<ReleaseAssetMeta>;
  versionAssets?: Map<string, { version: string; assets: Array<ReleaseAssetMeta> }>;
}

defineProps<Props>();

const selectedId = ref('');

const onSelect = (id: string) => {
  selectedId.value = id;
};
</script>

<style scoped lang="less">
.asset-preview-panel {
  display: flex;
  height: 100%;
  overflow: hidden;

  .asset-sidebar {
    width: 280px;
    border-right: 1px solid var(--td-border-level-1-color);
    display: flex;
    flex-direction: column;
    background: var(--td-bg-color-container);
    overflow: hidden;
  }

  .asset-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
