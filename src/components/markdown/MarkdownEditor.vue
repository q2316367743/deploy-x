<template>
  <div class="markdown-editor">
    <div ref="divRef" style="height: 600px"/>
  </div>
</template>
<script lang="ts" setup>
import {AiEditor} from "aieditor";
import {getExtname, joinPath} from "@/util/lang/FileUtil.ts";
import {APP_DATA_ASSET_DIR, isDark} from "@/global/Constants.ts";
import {BaseDirectory, exists, mkdir, writeFile} from "@tauri-apps/plugin-fs";
import {useSnowflake} from "@/util";
import {convertFileSrc} from "@tauri-apps/api/core";

const modelValue = defineModel<string>({
  type: String,
  default: '',
});
const props = defineProps({
  placeholder: String
});

const divRef = useTemplateRef<Element>('divRef');
const editorRef = ref<AiEditor>();

async function fileToUint8Array(file: File) {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

const uploader = async (file: File, extname: string, key: string) => {
  //可自定义图片上传逻辑
  // 获取时间
  const date = new Date();
  // 获取路径：资源目录/年-月/日
  const folder = joinPath(APP_DATA_ASSET_DIR(), `${date.getFullYear()}-${date.getMonth() + 1}`, `${date.getDate()}`.padStart(2, "0"))
  if (!await exists(folder)) {
    await mkdir(folder, {recursive: true, baseDir: BaseDirectory.AppData});
  }
  const originFilename = file.name;
  const originExtname = getExtname(originFilename);
  const filename = `${useSnowflake().nextId()}.${originExtname || extname}`;
  const path = joinPath(folder, filename);
  // 写入文件
  await writeFile(path, await fileToUint8Array(file), {createNew: true, baseDir: BaseDirectory.AppData});
  const data: Record<string, string> = {};
  data[key] = convertFileSrc(filename);
  data['data-src'] = path;
  data['alt'] = filename;
  data['fileName'] = filename;
  return {
    "errorCode": 0,
    "data": data
  }
}

onMounted(() => {
  if (!divRef) return;
  editorRef.value = new AiEditor({
    element: divRef.value as Element,
    placeholder: props.placeholder || "点击输入内容...",
    content: modelValue.value,
    theme: isDark.value ? "dark" : "light",
    draggable: false,
    image: {
      allowBase64: false,
      defaultSize: 350,
      uploader: async (file) => uploader(file, "png", 'src'),
      bubbleMenuItems: ["AlignLeft", "AlignCenter", "AlignRight", "delete"]
    },
    video: {
      uploader: (file) => uploader(file, 'mp4', 'src'),
    },
    attachment: {
      uploader: (file) => uploader(file, 'mp4', 'href'),
    }
  })
})
</script>
<style scoped lang="less">

</style>
