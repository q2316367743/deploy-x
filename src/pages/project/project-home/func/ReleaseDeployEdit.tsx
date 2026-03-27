import type {ReleaseDeployBase, ReleaseDeployCore} from "@/entity";
import {DatePicker, DialogPlugin, Form, FormItem, Input} from "tdesign-vue-next";
import {addReleaseDeployService} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

interface ReleaseDeployAddProp extends ReleaseDeployBase {
  onUpdate: () => void
}

export function openReleaseDeployAdd(prop: ReleaseDeployAddProp) {
  const data = ref<ReleaseDeployCore>({
    ...prop,
    deploy_time: Date.now(),
    deploy_user: ''
  });
  const dp = DialogPlugin({
    header: `在 ${prop.instance_id} 上部署 ${prop.version_id}`,
    confirmBtn: '部署',
    closeOnEscKeydown: false,
    closeOnOverlayClick: false,
    default: () => (<Form data={data.value}>
      <FormItem label={'部署用户'} labelAlign={"top"}>
        <Input v-model={data.value.deploy_user} clearable placeholder="请输入部署用户"/>
      </FormItem>
      <FormItem label={'部署时间'} labelAlign={"top"}>
        <DatePicker v-model={data.value.deploy_time} clearable placeholder="请输入部署时间"/>
      </FormItem>
    </Form>),
    onConfirm() {
      addReleaseDeployService(data.value)
        .then(() => {
          MessageUtil.success("发布成功");
          dp.destroy();
          prop.onUpdate();
        })
        .catch(e => {
          MessageUtil.error("发布失败", e);
        })
    }
  })
}