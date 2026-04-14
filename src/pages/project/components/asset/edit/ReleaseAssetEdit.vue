<template>
  <t-layout class="release-asset-container">
    <t-aside class="asset-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">附件文件</span>
        <t-space size="small">
          <t-button theme="primary" variant="text" size="small" shape="square" @click="handleAddOther">
            <template #icon>
              <upload-icon/>
            </template>
          </t-button>
          <t-dropdown trigger="click" placement="bottom">
            <t-button theme="primary" variant="text" size="small" shape="square">
              <template #icon>
                <add-icon/>
              </template>
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="handleAddDocument">
                <template #prefix-icon>
                  <file-word-icon/>
                </template>
                文档
              </t-dropdown-item>
              <t-dropdown-item @click="handleAddSql">
                <template #prefix-icon>
                  <file-code-icon/>
                </template>
                代码
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </t-space>
      </div>
      <div class="sidebar-content">
        <release-asset-tree
          :nodes="treeMeta"
          :active-value="selectedId"
          @select="onSelect"
          @contextmenu="handleContextMenu"
        />
      </div>
    </t-aside>
    <t-content class="asset-content">
      <div v-if="selectedAsset" class="editor-wrapper">
        <div class="editor-header">
          <div class="header-left">
            <t-input
              v-model="selectedAsset.filename"
              size="small"
              :borderless="true"
              @blur="handleRename"
            />
          </div>
          <div class="header-right">
            <t-button theme="primary" size="small" @click="handleSave">
              <template #icon>
                <save-icon/>
              </template>
              保存
            </t-button>
            <t-dropdown trigger="click">
              <t-button theme="default" variant="text" size="small" shape="square">
                <template #icon>
                  <more-icon/>
                </template>
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item theme="error" @click="handleDelete">
                  <template #prefix-icon>
                    <delete-icon/>
                  </template>
                  删除
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </div>
        <div class="editor-container">
          <markdown-editor
            v-if="selectedAsset.file_type === 1"
            :scope="scope"
            :scope-id="scopeId"
            v-model="editorContent"
          />
          <monaco-editor
            v-else
            v-model="editorContent"
            :language="editorLanguage"
            height="100%"
          />
        </div>
      </div>
      <div v-else class="empty-state">
        <t-icon name="file" size="48px"/>
        <p>选择一个文件开始编辑</p>
      </div>
    </t-content>
  </t-layout>
</template>
<script lang="ts" setup>
import {AddIcon, DeleteIcon, FileCodeIcon, FileWordIcon, MoreIcon, SaveIcon, UploadIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {inferMonacoLanguageByFilename} from "@/modules/monaco";
import ReleaseAssetTree from "./ReleaseAssetTree.vue";
import {openReleaseAssetContextMenu} from "@/pages/project/components/asset/edit/ReleaseAssetContextMenu.tsx";
import type {
  ReleaseAssetListItem,
  ReleaseAssetListItemType,
  ReleaseAssetScope
} from "@/pages/project/components/asset/types.ts";
import {
  createAssetItem,
  deleteAssetItem,
  loadAssetList,
  readAssetContent, renameAsset, saveAssetContent, uploadAssetItem
} from "@/pages/project/components/asset/func.tsx";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  scope: {
    type: String as PropType<ReleaseAssetScope>,
    required: true,
  },
  scopeId: {
    type: String,
    required: true,
  }
});

interface AssetTreeNode {
  label: string;
  value: string;
  type: ReleaseAssetListItemType;
}

const items = ref<Array<ReleaseAssetListItem>>([]);
const selectedId = ref<string>('');

const selectedAsset = ref<ReleaseAssetListItem>();

const editorContent = ref('');
const editorLanguage = computed(() => selectedAsset.value ? inferMonacoLanguageByFilename(selectedAsset.value.filename) : 'plaintext');


const treeMeta = computed(() => {
  return items.value.map(e => ({
    label: e.filename,
    value: e.path,
    type: e.file_type
  } as AssetTreeNode))
});

const onSelect = (value: string) => {
  if (selectedId.value === value) {
    selectedAsset.value = undefined;
    selectedId.value = '';
    return;
  }
  const asset = items.value.find(e => e.path === value);
  if (asset) {
    selectedAsset.value = asset;
    selectedId.value = value;
    loadAssetContent(asset);
  }
};

const handleContextMenu = async ({node, e}: { node: AssetTreeNode, e: PointerEvent }) => {
  const asset = items.value.find(item => item.path === node.value);
  if (!asset) return;

  await openReleaseAssetContextMenu(asset, e, () => {
    loadAssets();
    selectedAsset.value = undefined;
    selectedId.value = '';
  });
};

const loadAssetContent = async (asset: ReleaseAssetListItem) => {
  try {
    const content = await readAssetContent(asset);
    if (content) {
      editorContent.value = content;
    }
  } catch (error) {
    MessageUtil.error("加载附件内容失败", error);
  }
};

const handleSave = async () => {
  if (!selectedAsset.value) return;

  try {
    await saveAssetContent(selectedAsset.value, editorContent.value);
    MessageUtil.success("保存成功");
  } catch (error) {
    MessageUtil.error("保存失败", error);
  }
};

const handleRename = async () => {
  if (!selectedAsset.value) return;
  try {
    await renameAsset(selectedAsset.value)
  } catch (error) {
    MessageUtil.error("重命名失败", error);
  }
};

const handleDelete = () => {
  if (!selectedAsset.value) return;
  deleteAssetItem(selectedAsset.value, () => {
    loadAssets();
    // 如果选择择删除
    selectedAsset.value = undefined;
  })
};

const loadAssets = async () => {
  try {
    items.value = await loadAssetList(props.projectId, props.scope, props.scopeId);
  } catch (error) {
    MessageUtil.error("获取物料异常", error);
  }
};

const handleAddDocument = () => {
  createAssetItem(props.projectId, props.scope, props.scopeId, 1, loadAssets)
};

const handleAddSql = () => {
  createAssetItem(props.projectId, props.scope, props.scopeId, 2, loadAssets)
};

const handleAddOther = () => {
  // 文件上传
  uploadAssetItem(props.projectId, props.scope, props.scopeId)
    .then(() => loadAssets())
    .catch(e => {
      if (e) {
        MessageUtil.error("上传失败", e);
      }
    })
};

onMounted(() => {
  loadAssets();
});
</script>
<style scoped lang="less">
@import "ReleaseAssetEdit.less";
</style>
