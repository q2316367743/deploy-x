import {DialogPlugin} from "tdesign-vue-next";
import type {ReleaseAssetListItem} from "@/pages/project/components/asset/types.ts";
import MarkdownPreview from "@/components/markdown/MarkdownPreview.vue";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";
import {inferMonacoLanguageByFilename} from "@/modules/monaco";
import {readTextFile} from "@tauri-apps/plugin-fs";
import MessageUtil from "@/util/model/MessageUtil.ts";

export function openAssertContentDialog(asset: ReleaseAssetListItem) {
  const content = ref('');
  const editorLanguage = inferMonacoLanguageByFilename(asset.filename);

  readTextFile(asset.path).then((file) => {
    content.value = file;
  }).catch((error) => {
    MessageUtil.error("获取文件内容失败", error);
  })

  DialogPlugin({
    header: asset.filename,
    width: '80vw',
    footer: false,
    placement: 'center',
    attach: 'body',
    default: () => <div style={{
      border: '1px solid var(--td-border-level-1-color)',
      borderRadius: 'var(--td-radius-medium)',
      overflow: 'hidden',
    }}>
      {asset.file_type === 1 ?
        <div style={{height: 'calc(70vh - 12px)'}}><MarkdownPreview content={content.value}/></div> :
        <MonacoEditor modelValue={content.value} readonly={true} language={editorLanguage}
                      height="calc(70vh - 12px)"/>}

    </div>
  })
}