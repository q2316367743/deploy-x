<template>
  <div class="markdown-editor">
    <MdEditor v-model="modelValue" preview-theme="vuepress" code-theme="github" no-mermaid no-katex
              :placeholder="placeholder" :theme="theme" :toolbars="toolbars" class="h-full w-full"
              @onUploadImg="onUploadImg"/>
  </div>
</template>
<script lang="ts" setup>
import {MdEditor} from 'md-editor-v3';
import {isDark} from "@/global/Constants.ts";
import {markdownImageUploader} from "@/components/markdown/image.ts";

const modelValue = defineModel<string>({
  type: String,
  default: '',
});
defineProps({
  placeholder: String
});

const theme = computed(() => isDark.value ? "dark" : "light")

const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  '=',
  'pageFullscreen',
  'preview',
  'previewOnly',
  'catalog',
];

const onUploadImg = async (files: File[], callback: (urls: string[] | {
  url: string;
  alt: string;
  title: string
}[]) => void) => {
  const result = await Promise.all(files.map(file => markdownImageUploader(file)));
  callback(result);
}
</script>
<style scoped lang="less">
.markdown-editor {
  height: 100%;
}
</style>
