<template>
  <t-card title="附件列表" class="release-asset-list-container">

    <template #actions>
      <t-button theme="primary" variant="text" :disabled="items.length === 0">打包下载</t-button>
    </template>

    <div class="list-content">
      <t-loading :loading="loading">
        <div v-if="items.length === 0" class="empty-state">
          <t-icon name="file" size="48px"/>
          <p>暂无附件</p>
        </div>
        <div v-else class="file-list">
          <div
            v-for="item in items"
            :key="item.path"
            class="file-item"
            @click="handleFileClick(item)"
          >
            <div class="file-icon">
              <file-word-icon v-if="item.file_type === 1"/>
              <file-code-icon v-else-if="item.file_type === 2"/>
              <file-icon v-else/>
            </div>
            <div class="file-info">
              <div class="file-name">{{ item.filename }}</div>
              <div class="file-meta">{{ ReleaseAssetListItemTypeLabel[item.file_type] || '未知类型' }}</div>
            </div>
          </div>
        </div>
      </t-loading>
    </div>

  </t-card>
</template>

<script lang="ts" setup>
import MessageUtil from "@/util/model/MessageUtil.ts";
import {FileCodeIcon, FileIcon, FileWordIcon,} from "tdesign-icons-vue-next";
import {
  type ReleaseAssetListItem,
  ReleaseAssetListItemTypeLabel,
  type ReleaseAssetScope
} from "@/pages/project/components/asset/types.ts";
import {openAssertContentDialog} from "@/pages/project/components/asset/list/AssertContentDialog.tsx";
import {loadAssetList} from "@/pages/project/components/asset/func.tsx";

const props = defineProps({
  scopeId: {
    type: String,
    required: true,
  },
  scope: {
    type: String as PropType<ReleaseAssetScope>,
    required: true,
  }
});

const items = ref<Array<ReleaseAssetListItem>>([]);
const loading = ref(false);

const loadAssets = async () => {
  loading.value = true;
  try {
    items.value = await loadAssetList(props.scope, props.scopeId);
  } catch (error) {
    MessageUtil.error("获取附件列表失败", error);
  } finally {
    loading.value = false;
  }
};

const handleFileClick = async (asset: ReleaseAssetListItem) => {
  if (asset.file_type === 3) {
    // 附件
    MessageUtil.warning("附件无法预览，请下载后查看")
    return;
  }
  openAssertContentDialog(asset);
};


onMounted(() => {
  loadAssets();
});
</script>

<style scoped lang="less">
@import "ReleaseAssetList.less";
</style>
