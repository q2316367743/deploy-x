import type {ReleaseVersion, ReleaseVersionCore} from "@/entity";
import {DatePicker, DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import {
  addReleaseVersionService,
  deleteReleaseVersionService,
  updateReleaseVersionService
} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Ctx from '@imengyu/vue3-context-menu';
import {isDark} from "@/global/Constants.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {cloneDeep} from "es-toolkit";

export function openReleaseVersionAdd(projectId: string, onUpdate: () => void) {
  const data = ref<ReleaseVersionCore>({
    version: '',
    publish_time: Date.now(),
    publish_user: ''
  });
  const dp = DialogPlugin({
    header: '新增版本',
    confirmBtn: '新增',
    default: () => (<Form data={data.value}>
      <FormItem label={'版本号'} labelAlign={'top'}>
        <Input placeholder={'请输入版本号'} v-model={data.value.version}/>
      </FormItem>
      <FormItem label={'部署人'} labelAlign={'top'}>
        <Input placeholder={'请输入部署人'} v-model={data.value.publish_user}/>
      </FormItem>
      <FormItem label={'部署时间'} labelAlign={'top'}>
        <DatePicker placeholder={'请选择部署时间'} v-model={data.value.publish_time}/>
      </FormItem>
    </Form>),
    onConfirm() {
      addReleaseVersionService(projectId, data.value)
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

export function openReleaseVersionUpdate(version: ReleaseVersion, onUpdate: () => void) {
  const data = ref<ReleaseVersionCore>(cloneDeep(version));
  const dp = DialogPlugin({
    header: '更新版本',
    confirmBtn: '更新',
    default: () => (<Form data={data.value}>
      <FormItem label={'版本号'} labelAlign={'top'}>
        <Input placeholder={'请输入版本号'} v-model={data.value.version}/>
      </FormItem>
      <FormItem label={'部署人'} labelAlign={'top'}>
        <Input placeholder={'请输入部署人'} v-model={data.value.publish_user}/>
      </FormItem>
      <FormItem label={'部署时间'} labelAlign={'top'}>
        <t-date-picker placeholder={'请选择部署时间'} v-model={data.value.publish_time}/>
      </FormItem>
    </Form>),
    onConfirm() {
      updateReleaseVersionService(version.id, data.value)
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

export function openReleaseVersionContextmenu(version: ReleaseVersion, onUpdate: () => void, e: PointerEvent) {
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
          openReleaseVersionUpdate(version, onUpdate);
        }
      },
      {
        label: () => <span class={'label color-red'}>删除</span>,
        icon: () => <DeleteIcon class={'color-red'}/>,
        onClick: () => {
          MessageBoxUtil.confirm("是否删除版本？", "删除版本").then(() => {
            deleteReleaseVersionService(version.id)
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
