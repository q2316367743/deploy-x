import {Button, Form, FormItem, Input, Radio, RadioGroup, Textarea} from "tdesign-vue-next";
import {open} from "@tauri-apps/plugin-dialog";
import {exists, readTextFile} from "@tauri-apps/plugin-fs";
import {homeDir} from "@tauri-apps/api/path";
import {FolderIcon, UploadIcon} from "tdesign-icons-vue-next";
import {addHostCredential, removeHostCredential, updateHostCredential} from "@/service";
import {buildHostCredentialCore, type HostCredential, type HostCredentialCore} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

function buildDefault(data: Ref<HostCredentialCore>) {
  const handleLoadLocalSecret = async () => {
    const h = await homeDir();
    const path = `${h}/.ssh/id_rsa`
    console.log(path)
    try {
      const fileExists = await exists(path);
      if (!fileExists) {
        MessageUtil.error(`文件不存在: ${path}`);
        return;
      }
      data.value.secret = await readTextFile(path);
      MessageUtil.success("密钥加载成功");
    } catch (e) {
      MessageUtil.error("读取密钥文件失败", e);
    }
  };

  const handleUploadSecret = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "Private Key",
          extensions: ["pem", "key", "pub", ""]
        }]
      });
      if (!selected) return;
      data.value.secret = await readTextFile(selected);
      MessageUtil.success("密钥上传成功");
    } catch (e) {
      MessageUtil.error("上传密钥失败", e);
    }
  };

  return () => <Form data={data.value} labelAlign={'top'}>
    <FormItem label={'名称'} name={'name'}
              rules={[{required: true, message: '请输入凭证名称', type: 'error'}]}>
      <Input v-model={data.value.name} placeholder="请输入凭证名称"/>
    </FormItem>
    <FormItem label={'验证方式'} name={'type'}
              rules={[{required: true, message: '请选择验证方式', type: 'error'}]}>
      <RadioGroup v-model={data.value.type} class="w-full">
        <Radio value="password">密码</Radio>
        <Radio value="secret">密钥</Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label={'登录用户'} name={'username'}
              rules={[{required: true, message: '请输入登录用户', type: 'error'}]}>
      <Input v-model={data.value.username} placeholder="请输入登录用户名"/>
    </FormItem>
    {data.value.type === 'password' && (
      <FormItem label={'登录密码'} name={'password'}
                rules={[{required: true, message: '请输入登录密码', type: 'error'}]}>
        <Input v-model={data.value.password} type="password" placeholder="请输入登录密码"/>
      </FormItem>
    )}
    {data.value.type === 'secret' && (
      <>
        <FormItem label={'登录密钥'} name={'secret'}
                  rules={[{required: true, message: '请输入或上传密钥', type: 'error'}]}>
          <Textarea
            v-model={data.value.secret}
            placeholder="请输入密钥内容，或从本地文件加载"
            autosize={{minRows: 3, maxRows: 6}}
          />
        </FormItem>
        <FormItem label={'密钥密码'} name={'password'}>
          <Input
            v-model={data.value.password}
            type="password"
            placeholder="如果密钥有密码保护，请输入密钥密码（可选）"
          />
        </FormItem>
        <div class="flex gap-2">
          <Button
            theme="default"
            variant="outline"
            onClick={handleLoadLocalSecret}
          >{{
            icon: () => <FolderIcon/>,
            default: () => <span>加载本地密钥</span>
          }}</Button>
          <Button
            theme="primary"
            variant="outline"
            onClick={handleUploadSecret}
          >{{
            icon: () => <UploadIcon/>,
            default: () => <span>选择文件上传</span>
          }}</Button>
        </div>
      </>
    )}
  </Form>;
}

export function addHomeCredential(onUpdate: () => void) {
  const data = ref<HostCredentialCore>(buildHostCredentialCore());
  const dp = DrawerPlugin({
    header: '新增凭证',
    size: '600px',
    default: buildDefault(data),
    closeOnEscKeydown: false,
    onConfirm: () => {
      addHostCredential(data.value)
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

export function updateHomeCredential(old: HostCredential, onUpdate: () => void) {
  const data = ref<HostCredentialCore>(old);
  const dp = DrawerPlugin({
    header: '修改凭证',
    size: '600px',
    default: buildDefault(data),
    closeOnEscKeydown: false,
    onConfirm: () => {
      updateHostCredential(old.id, data.value)
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

export function deleteHomeCredential(id: string, onUpdate: () => void) {
  MessageBoxUtil.confirm("是否删除此凭证", "删除凭证").then(() => {
    removeHostCredential(id)
      .then(() => {
        onUpdate();
        MessageUtil.success("删除成功");
      }).catch(e => {
      MessageUtil.error("删除失败", e);
    })
  })
}
