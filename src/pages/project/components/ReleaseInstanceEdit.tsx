import type {ReleaseInstanceCore} from "@/entity";
import {DialogPlugin, Form, FormItem, Input, Textarea} from "tdesign-vue-next";
import {
  addReleaseInstanceService,
  deleteReleaseInstanceService, type ReleaseInstanceVersion,
  updateReleaseInstanceService
} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Ctx from '@imengyu/vue3-context-menu';
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";

export function openReleaseInstanceAdd(projectId: string, onUpdate: () => void) {
  const data = ref<ReleaseInstanceCore>({
    name: '',
    desc: ''
  });
  const dp = DialogPlugin({
    header: '新增实例',
    confirmBtn: '新增',
    closeOnEscKeydown: false,
    closeOnOverlayClick: false,
    default: () => (<Form data={data.value}>
      <FormItem label={'实例名称'} labelAlign={'top'}>
        <Input placeholder={'请输入实例名称'} v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'实例描述'} labelAlign={'top'}>
        <Textarea placeholder={'请输入实例描述'} v-model={data.value.desc} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>),
    onConfirm() {
      addReleaseInstanceService(projectId, data.value)
        .then(() => {
          MessageUtil.success("新增成功");
          onUpdate();
          dp.destroy();
        })
        .catch(e => {
          MessageUtil.error("更新失败", e);
        })
    }
  })
}

export function openReleaseInstanceUpdate(instance: ReleaseInstanceVersion, onUpdate: () => void) {
  const data = ref<ReleaseInstanceCore>({
    name: instance.instance_name,
    desc: instance.instance_desc
  });
  const dp = DialogPlugin({
    header: '更新实例',
    confirmBtn: '更新',
    default: () => (<Form data={data.value}>
      <FormItem label={'实例名称'} labelAlign={'top'}>
        <Input placeholder={'请输入实例名称'} v-model={data.value.name}/>
      </FormItem>
      <FormItem label={'实例描述'} labelAlign={'top'}>
        <Textarea placeholder={'请输入实例描述'} v-model={data.value.desc} autosize={{minRows: 3, maxRows: 10}}/>
      </FormItem>
    </Form>),
    onConfirm() {
      updateReleaseInstanceService(instance.instance_id, data.value)
        .then(() => {
          MessageUtil.success("更新成功");
          onUpdate();
          dp.destroy();
        })
        .catch(e => {
          MessageUtil.error("更新失败", e);
        })
    }
  })
}


export function openReleaseInstanceContextmenu(instance: ReleaseInstanceVersion, onUpdate: () => void, e: PointerEvent) {
  e.stopPropagation();
  e.preventDefault();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [
      {
        label: "更新",
        icon: () => <EditIcon/>,
        onClick: () => {
          openReleaseInstanceUpdate(instance, onUpdate);
        }
      },
      {
        label: () => <span class={'label color-red'}>删除</span>,
        icon: () => <DeleteIcon class={'color-red'}/>,
        onClick: () => {
          MessageBoxUtil.confirm("是否删除实例？", "删除实例").then(() => {
            deleteReleaseInstanceService(instance.instance_id)
              .then(() => {
                MessageUtil.success("删除成功");
                onUpdate();
              })
              .catch(e => {
                MessageUtil.error("删除失败", e);
              })
          })
        }
      }
    ]
  })
}
