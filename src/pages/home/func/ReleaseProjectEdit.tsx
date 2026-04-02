import {DialogPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import type {ReleaseProject, ReleaseProjectCore} from "@/entity";
import {addReleaseProject, deleteReleaseProject, updateReleaseProject} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Cxt from "@imengyu/vue3-context-menu";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {cloneDeep} from "es-toolkit";

export function openReleaseProjectDialog(onUpdate: () => void) {
  const data = ref<ReleaseProjectCore>({
    name: '',
    desc: '',
  });
  const dp = DialogPlugin({
    header: '发布项目',
    width: '450px',
    confirmBtn: '发布',
    default: () => <Form>
      <FormItem label={'项目名'} labelAlign={'top'}>
        <Input placeholder={'请输入项目名'} v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'项目描述'} labelAlign={'top'}>
        <Textarea placeholder={'请输入项目描述'} v-model={data.value.desc} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>,
    onConfirm() {
      addReleaseProject(data.value).then(() => {
        onUpdate();
        dp.destroy();
        MessageUtil.success("发布成功");
      })
    }
  })
}

export function openReleaseProjectUpdate(project: ReleaseProject, onUpdate: () => void) {
  const data = ref<ReleaseProjectCore>(cloneDeep(project));
  const dp = DialogPlugin({
    header: '修改项目',
    width: '450px',
    confirmBtn: '修改',
    default: () => <Form>
      <FormItem label={'项目名'} labelAlign={'top'}>
        <Input placeholder={'请输入项目名'} v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'项目描述'} labelAlign={'top'}>
        <Textarea placeholder={'请输入项目描述'} v-model={data.value.desc} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>,
    onConfirm() {
      updateReleaseProject(project.id, data.value).then(() => {
        onUpdate();
        dp.destroy();
        MessageUtil.success("修改成功");
      })
    }
  })
}

export async function openReleaseProjectCxt(e: PointerEvent, project: ReleaseProject, onUpdate: () => void) {
  e.preventDefault();
  e.stopPropagation();
  Cxt.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: '编辑',
        icon: () => <EditIcon/>,
        onClick: () => {
          openReleaseProjectUpdate(project, onUpdate);
        }
      },
      {
        label: () => <span class={'label'} style={{color: 'var(--td-error-color)'}}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => {
          MessageBoxUtil.confirm("确定要删除吗？", "删除项目")
            .then(() => {
              deleteReleaseProject(project.id).then(() => {
                MessageUtil.success("删除成功");
                onUpdate();
              })
                .catch(e => MessageUtil.error("删除失败", e));
            })
        }
      }
    ]
  })
}