import {Form, FormItem, Input, InputNumber, Radio, RadioGroup, Select, Textarea} from "tdesign-vue-next";
import {addHost, listHostCredential, removeHost, updateHost} from "@/service";
import {type Host, type HostCore, buildHostCore} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

function buildDefault(data: Ref<HostCore>, credentials: Ref<{ label: string; value: string }[]>) {
  return () => <Form data={data.value} labelAlign={'top'}>
    <FormItem label={'名称'} name={'name'}
              rules={[{required: true, message: '请输入主机名称', type: 'error'}]}>
      <Input v-model={data.value.name} placeholder="请输入主机名称"/>
    </FormItem>
    <FormItem label={'主机地址'} name={'host'}
              rules={[{required: true, message: '请输入主机地址', type: 'error'}]}>
      <Input v-model={data.value.host} placeholder="请输入主机地址，如 192.168.1.100"/>
    </FormItem>
    <FormItem label={'端口'} name={'port'}
              rules={[{required: true, message: '请输入端口号', type: 'error'}]}>
      <InputNumber v-model={data.value.port} min={1} max={65535} placeholder="请输入端口号"/>
    </FormItem>
    <FormItem label={'认证方式'} name={'auth_type'}
              rules={[{required: true, message: '请选择认证方式', type: 'error'}]}>
      <RadioGroup v-model={data.value.auth_type} class="w-full">
        <Radio value="password">密码</Radio>
        <Radio value="secret">密钥</Radio>
        <Radio value="credential">凭证</Radio>
      </RadioGroup>
    </FormItem>
    {data.value.auth_type !== 'credential' && (<FormItem label={'认证用户'} name={'auth_user'}
              rules={[{required: true, message: '请输入认证用户', type: 'error'}]}>
      <Input v-model={data.value.auth_user} placeholder="请输入认证用户名"/>
    </FormItem>
    )}
    {data.value.auth_type === 'password' && (
      <FormItem label={'认证密码'} name={'auth_password'}
                rules={[{required: true, message: '请输入认证密码', type: 'error'}]}>
        <Input v-model={data.value.auth_password} type="password" placeholder="请输入认证密码"/>
      </FormItem>
    )}
    {data.value.auth_type === 'secret' && (
      <FormItem label={'认证密钥'} name={'auth_secret'}
                rules={[{required: true, message: '请输入认证密钥', type: 'error'}]}>
        <Textarea
          v-model={data.value.auth_secret}
          placeholder="请输入密钥内容"
          autosize={{minRows: 3, maxRows: 6}}
        />
      </FormItem>
    )}
    {data.value.auth_type === 'credential' && (
      <FormItem label={'选择凭证'} name={'credential_id'}
                rules={[{required: true, message: '请选择凭证', type: 'error'}]}>
        <Select
          v-model={data.value.credential_id}
          placeholder="请选择连接凭证"
          options={credentials.value}
          filterable
        />
      </FormItem>
    )}
    <FormItem label={'备注'} name={'remark'}>
      <Textarea v-model={data.value.remark} placeholder="请输入备注信息（可选）" autosize={{minRows: 2, maxRows: 4}}/>
    </FormItem>
  </Form>;
}

export function addHomeHost(onUpdate: () => void) {
  const data = ref<HostCore>(buildHostCore());
  const credentials = ref<{ label: string; value: string }[]>([]);

  listHostCredential().then(list => {
    credentials.value = list.map(c => ({label: c.name, value: c.id}));
  });

  const dp = DrawerPlugin({
    header: '新增主机',
    size: '600px',
    default: buildDefault(data, credentials),
    closeOnEscKeydown: false,
    onConfirm: () => {
      addHost(data.value)
        .then(() => {
          onUpdate();
          MessageUtil.success("新增成功");
          dp.destroy?.();
        }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    }
  })
}

export function updateHomeHost(old: Host, onUpdate: () => void) {
  const data = ref<HostCore>(old);
  const credentials = ref<{ label: string; value: string }[]>([]);

  listHostCredential().then(list => {
    credentials.value = list.map(c => ({label: c.name, value: c.id}));
  });

  const dp = DrawerPlugin({
    header: '修改主机',
    size: '600px',
    default: buildDefault(data, credentials),
    closeOnEscKeydown: false,
    onConfirm: () => {
      updateHost(old.id, data.value)
        .then(() => {
          onUpdate();
          MessageUtil.success("修改成功");
          dp.destroy?.();
        }).catch(e => {
        MessageUtil.error("修改失败", e);
      })
    }
  })
}

export function deleteHomeHost(id: string, onUpdate: () => void) {
  MessageBoxUtil.confirm("是否删除此主机", "删除主机").then(() => {
    removeHost(id)
      .then(() => {
        onUpdate();
        MessageUtil.success("删除成功");
      }).catch(e => {
      MessageUtil.error("删除失败", e);
    })
  })
}
