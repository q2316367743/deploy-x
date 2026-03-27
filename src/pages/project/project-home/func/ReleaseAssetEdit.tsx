import type {
  ReleaseAssetMetaCore,
  ReleaseAssetMetaFileType,
  ReleaseAssetMetaScope
} from "@/entity";
import {DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import {addReleaseAsset} from "@/service";

interface ReleaseAssetAddProp {
  onUpdate: () => void;
  projectId: string;
  scope: ReleaseAssetMetaScope;
  scopeId: string;
  fileType: ReleaseAssetMetaFileType
}

export async function openReleaseAssetAdd(props: ReleaseAssetAddProp) {
  const {fileType, projectId, scope, scopeId, onUpdate} = props;

  const data = ref<ReleaseAssetMetaCore>({
    relative_path: '',
    file_name: '',
    file_type: fileType
  })

  const dp = DialogPlugin({
    header: `新增 ${fileType}`,
    confirmBtn: '新增',
    default: () => (
      <Form data={data.value}>
        <FormItem label={'文件名'}>
          <Input v-model={data.value.file_name} placeholder={'请输入文件名'} />
        </FormItem>
        <FormItem label={'文件所在目录'}>
          <Input v-model={data.value.relative_path} placeholder={'请输入文件所在目录'} />
        </FormItem>
      </Form>
    ),
    onConfirm: async () => {
      await addReleaseAsset(projectId, scope, scopeId, data.value)
      onUpdate()
      dp.destroy()
    },
  })
}