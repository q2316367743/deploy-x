<template>
  <div class="markdown-preview">
    <MdPreview :modelValue="content" preview-theme="vuepress" code-theme="github" no-mermaid no-katex :theme="theme"/>
  </div>
</template>

<script lang="ts" setup>
import {MdPreview} from "md-editor-v3";
import {isDark} from "@/global/Constants.ts";

defineProps({
  content: {
    type: String,
    default: ''
  }
})

const theme = computed(() => isDark.value ? "dark" : "light")


</script>

<style scoped lang="less">

.markdown-preview {
  height: calc(100% - 16px);
  padding: 8px;
  overflow-y: auto;
  font-size: 15px;
  line-height: 1.75;
  color: #252933;
  word-wrap: break-word;


  :deep(.md-editor) {
    background-color: transparent !important;
  }

  :deep(h1), :deep(h2), :deep(h3),
  :deep(h4), :deep(h5), :deep(h6) {
    margin: 24px 0 16px;
    font-weight: 600;
    line-height: 1.4;
  }

  :deep(h1) {
    font-size: 1.75em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #e5e6eb;
  }

  :deep(h2) {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #e5e6eb;
  }

  :deep(h3) {
    font-size: 1.25em;
  }

  :deep(h4) {
    font-size: 1.1em;
  }

  :deep(p) {
    margin: 0 0 16px;
  }

  :deep(a) {
    color: #1e80ff;
    text-decoration: none;
    border-bottom: 1px solid transparent;

    &:hover {
      border-bottom-color: #1e80ff;
    }
  }

  :deep(blockquote) {
    margin: 16px 0;
    padding: 8px 16px;
    border-left: 4px solid #1e80ff;
    background: #f2f3f5;
    color: #515767;
    border-radius: 0 4px 4px 0;

    p:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul), :deep(ol) {
    margin: 0 0 16px;
    padding-left: 2em;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(li > ul), :deep(li > ol) {
    margin: 4px 0;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 4px;
    margin: 8px 0;
  }

  :deep(hr) {
    margin: 24px 0;
    border: none;
    border-top: 1px solid #e5e6eb;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;
  }

  :deep(th), :deep(td) {
    border: 1px solid #e5e6eb;
    padding: 10px 14px;
    text-align: left;
  }

  :deep(th) {
    background: #f7f8fa;
    font-weight: 600;
  }

  :deep(tr:nth-child(2n)) {
    background: #fafbfc;
  }

  :deep(code) {
    font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 0.9em;
    padding: 2px 6px;
    background: #f2f3f5;
    border-radius: 3px;
    color: #c9252a;
  }

  :deep(pre) {
    margin: 16px 0;
    border-radius: 4px;
    overflow: hidden;
  }

  :deep(pre code) {
    font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 0;
    background: none;
    color: inherit;
    border-radius: 0;
  }

  :deep(.hljs-code-block) {
    position: relative;
    margin: 16px 0;
    border-radius: 8px;
    overflow: hidden;
    background: #fafafa;

    .code-block-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: #f0f0f0;
      border-bottom: 1px solid #e5e6eb;

      .code-block-lang {
        font-size: 12px;
        color: #8b949e;
        font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    code {
      display: block;
      padding: 16px;
      overflow-x: auto;
    }
  }

  :deep(input[type="checkbox"]) {
    margin-right: 6px;
  }

  // 暗色模式适配
  html.dark & {
    color: #e5e6eb;

    :deep(h1), :deep(h2) {
      border-bottom-color: #3a3f4b;
    }

    :deep(a) {
      color: #4e8ef7;
    }

    :deep(a:hover) {
      border-bottom-color: #4e8ef7;
    }

    :deep(blockquote) {
      background: #2a2d31;
      border-left-color: #4e8ef7;
      color: #a9aeb8;
    }

    :deep(code) {
      background: #2a2d31;
      color: #e06c75;
    }

    :deep(th) {
      background: #2a2d31;
    }

    :deep(th), :deep(td) {
      border-color: #3a3f4b;
    }

    :deep(tr:nth-child(2n)) {
      background: #1e2023;
    }

    :deep(hr) {
      border-top-color: #3a3f4b;
    }

    :deep(.hljs-code-block) {
      background: #282c34;

      .code-block-header {
        background: #21252b;
        border-bottom-color: #3a3f4b;

        .code-block-lang {
          color: #9ca3af;
        }
      }
    }
  }
}
</style>
