<template>
  <div class="monaco-editor">
    <div ref="containerRef" class="monaco-editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import {isDark} from "@/global/Constants.ts"
import type {MonacoLanguage} from "@/modules/monaco"

const modelValue = defineModel({
  type: String,
  default: ''
})

interface Props {
  language: MonacoLanguage;
  readonly?: boolean;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  height: '100%',
});


const containerRef = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;


const initEditor = async () => {
  if (!containerRef.value) return;

  editor = monaco.editor.create(containerRef.value, {
    value: modelValue.value,
    language: props.language,
    readOnly: props.readonly,
    theme: isDark.value ? 'vs-dark' : 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    padding: { top: 10, bottom: 10 }
  });

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() ?? '';
    modelValue.value = value;
  });

  watch(isDark, value => {
    editor?.updateOptions({
      theme: value ? 'vs-dark' : 'vs'
    })
  });

};

onMounted(() => {
  initEditor();
});

onUnmounted(() => {
  editor?.dispose();
});

watch(
  modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue);
    }
  }
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
    }
  }
);
</script>

<style scoped lang="less">
.monaco-editor {
  width: 100%;
  height: v-bind(height);
  overflow: hidden;
  border: 1px solid var(--td-border-level-1-color);
  border-radius: var(--td-radius-medium);

  .monaco-editor-container {
    width: 100%;
    height: v-bind(height);
    overflow: hidden;
  }
}
</style>
