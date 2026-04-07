import {addReleaseCredential, type ReleaseCredentialAddFrom} from "@/service/release/ReleaseCredentialService.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Form, FormItem, Input, Textarea, Select, Button} from "tdesign-vue-next";
import {DeleteIcon} from 'tdesign-icons-vue-next';

export const openAddCredentialDrawer = (
  projectId: string, instanceId: string, onUpdate: () => void) => {
  const data = ref<ReleaseCredentialAddFrom>({
    name: '',
    desc: '',
    items: [{key: '', value_type: 'text', desc: '', value: ''}]
  });

  const addItem = () => {
    data.value.items.push({key: '', value_type: 'text', desc: '', value: ''});
  };

  const removeItem = (index: number) => {
    data.value.items.splice(index, 1);
  };

  const dp = DrawerPlugin({
    header: '新增凭证组',
    confirmBtn: '新增',
    size: '600px',
    onConfirm: () => {
      addReleaseCredential(projectId, instanceId, data.value).then(() => {
        MessageUtil.success("新增成功");
        onUpdate();
        dp.destroy?.();
      }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    },
    default: () => <Form data={data.value}>
      <FormItem label={'凭证组名称'} labelAlign={'top'}>
        <Input v-model={data.value.name} placeholder="请输入凭证组名称"/>
      </FormItem>
      <FormItem label={'凭证组描述'} labelAlign={'top'}>
        <Textarea v-model={data.value.desc} autosize={{minRows: 3, maxRows: 5}} placeholder="请输入凭证组描述"/>
      </FormItem>
      <FormItem label={'凭证项'} labelAlign={'top'}>
        <div class="flex flex-col gap-4 w-full">
          {data.value.items.map((item, index) => (
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <Input
                  v-model={item.key}
                  placeholder="凭证项名称"
                />
              </div>
              <div class="w-32">
                <Select
                  v-model={item.value_type}
                  options={[
                    {label: '文本', value: 'text'},
                    {label: '密码', value: 'password'}
                  ]}
                />
              </div>
              <div class="flex-1">
                <Input
                  v-model={item.desc}
                  placeholder="凭证项描述"
                />
              </div>
              {data.value.items.length > 1 && (
                <Button
                  theme="danger"
                  variant="text"
                  shape="square"
                  onClick={() => removeItem(index)}
                >
                  <DeleteIcon/>
                </Button>
              )}
            </div>
          ))}
          <Button theme="default" variant="dashed" onClick={addItem}>
            + 添加凭证项
          </Button>
        </div>
      </FormItem>
    </Form>
  })
}