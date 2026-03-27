<template>
  <div class="asset-preview-container">
    <div v-if="selectedAsset" class="asset-content">
      <div class="asset-editor">
        <markdown-preview
          v-if="selectedAsset.file_type === 'document'"
          :content="editorContent"
        />
        <monaco-editor
          v-else
          v-model="editorContent"
          :language="editorLanguage"
          :readonly="true"
          height="100%"
        />
      </div>
    </div>
    <div v-else class="empty-state">
      <t-icon name="file" size="48px"/>
      <p>选择一个文件查看内容</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ReleaseAssetMeta} from "@/entity";
import {getReleaseAssetContent} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import {inferMonacoLanguageByFilename} from "@/modules/monaco";

interface Props {
  assets: Array<ReleaseAssetMeta>;
  selectedId: string;
}

const props = defineProps<Props>();

const selectedAsset = computed(() => props.assets.find(a => a.id === props.selectedId));
const editorContent = ref('');
const editorLanguage = ref('plaintext');

watch(() => props.selectedId, async (newId) => {
  const asset = props.assets.find(a => a.id === newId);
  if (asset) {
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
  }
}, { immediate: true });
</script>

<style scoped lang="less">
.asset-preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .asset-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .asset-editor {
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
</style>
