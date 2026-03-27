import {getReleaseInstanceService} from "@/service";
import type {ReleaseInstance, ReleaseAssetMeta} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {listReleaseAssetMeta} from "@/service";
import {Descriptions, DescriptionsItem, DialogPlugin, TabPanel, Tabs} from "tdesign-vue-next";
import ReleaseAsset from "@/pages/project/table/components/ReleaseAsset.vue";

export async function openReleaseInstanceInfo(projectId: string, instanceId: string) {
  // 获取实例信息
  const instance = ref<ReleaseInstance | null>();
  // 获取附件信息
  const metas = ref(new Array<ReleaseAssetMeta>());

  getReleaseInstanceService(instanceId, projectId)
    .then(res => instance.value = res)
    .catch(e => MessageUtil.error("获取部署实例错误", e));
  listReleaseAssetMeta(projectId, 'instance', instanceId)
    .then(res => metas.value = res)
    .catch(e => MessageUtil.error("获取附件错误", e));

  DialogPlugin({
    header: false,
    footer: false,
    placement: "center",
    width: '80vw',
    closeOnEscKeydown: false,
    closeOnOverlayClick: false,
    dialogClassName: "release-instance-info",
    default: () => (<Tabs defaultValue={1}>
      <TabPanel label={'基本信息'} value={1}>
        <Descriptions column={1} layout={'vertical'}>
          <DescriptionsItem label={'名称'}>
            <div class={'info-item-value'}>{instance.value?.name}</div>
          </DescriptionsItem>
          <DescriptionsItem label={'描述'}>
            <div class={'info-item-value'}>{instance.value?.desc}</div>
          </DescriptionsItem>
        </Descriptions>
      </TabPanel>
      <TabPanel label={'物料'}>
        <ReleaseAsset projectId={projectId} scope={'instance'} scopeId={instanceId}/>
      </TabPanel>
    </Tabs>)
  })

}