import type {ReleaseDeployBase, ReleaseDeployCore} from "@/entity";
import {DatePicker, DialogPlugin, Form, FormItem, Input, Link} from "tdesign-vue-next";
import {addReleaseDeployService} from "@/service";
import MessageUtil from "@/util/model/MessageUtil.ts";

interface ReleaseDeployAddProp extends ReleaseDeployBase {
  instanceName: string;
  versionName: string;
  onUpdate: () => void
}

export function openReleaseDeployAdd(prop: ReleaseDeployAddProp) {
  const data = ref<ReleaseDeployCore>({
    project_id: prop.project_id,
    version_id: prop.version_id,
    instance_id: prop.instance_id,
    deploy_time: Date.now(),
    deploy_user: ''
  });
  // `在 ${prop.instanceName} 上部署 ${prop.versionName}`
  const dp = DialogPlugin({
    header: () => <div>
      <span>在「</span>
      <Link theme={'primary'}>{prop.instanceName}</Link>
      <span>」上部署「</span>
      <Link theme={'primary'}>{prop.versionName}</Link>
      <span>」</span>
    </div>,
    confirmBtn: '部署',
    closeOnEscKeydown: false,
    closeOnOverlayClick: false,
    default: () => (<Form data={data.value}>
      <FormItem label={'部署用户'} labelAlign={"top"}>
        <Input v-model={data.value.deploy_user} clearable placeholder="请输入部署用户"/>
      </FormItem>
      <FormItem label={'部署时间'} labelAlign={"top"}>
        <DatePicker v-model={data.value.deploy_time} placeholder="请输入部署时间" enableTimePicker={true}
                    format={"YYYY-MM-DD HH:mm"}/>
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