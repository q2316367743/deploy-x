import {getReleaseVersionService,listReleaseAssetMeta} from "@/service";
import type {ReleaseVersion, ReleaseAssetMeta} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Descriptions, DescriptionsItem, DialogPlugin, TabPanel, Tabs} from "tdesign-vue-next";
import ReleaseAsset from "@/pages/project/project-home/components/ReleaseAsset.vue";
import {getReleaseVersionLog, saveReleaseVersionLog} from "@/service";
import MarkdownEditor from "@/components/markdown/MarkdownEditor.vue";
import {logDebug} from "@/lib/log.ts";

export async function openReleaseVersionInfo(projectId: string, versionId: string) {
  const version = ref<ReleaseVersion | null>();
  const metas = ref(new Array<ReleaseAssetMeta>());
  const content = ref('');

  getReleaseVersionService(versionId, projectId)
    .then(res => version.value = res)
    .catch(e => MessageUtil.error("获取版本错误", e));
  listReleaseAssetMeta(projectId, 'version', versionId)
    .then(res => metas.value = res)
    .catch(e => MessageUtil.error("获取附件错误", e));
  // 获取更新日志
  getReleaseVersionLog(versionId)
    .then(res => {
      content.value = res.content;
      watch(content, (value) => {
        saveReleaseVersionLog(versionId, value)
          .then(() => logDebug("保存成功"))
          .catch(e => MessageUtil.error("保存更新日志失败", e));
      })
    })
    .catch(e => MessageUtil.error("获取版本错误", e));

  DialogPlugin({
    header: false,
    footer: false,
    placement: "center",
    width: '80vw',
    dialogClassName: "release-version-info",
    default: () => (<Tabs defaultValue={1}>
      <TabPanel label={'基本信息'} value={1}>
        <Descriptions column={1} layout={'vertical'}>
          <DescriptionsItem label={'版本'}>
            <div class={'info-item-value'}>{version.value?.version}</div>
          </DescriptionsItem>
          <DescriptionsItem label={'部署人'}>
            <div class={'info-item-value'}>{version.value?.publish_user}</div>
          </DescriptionsItem>
          <DescriptionsItem label={'部署时间'}>
            <div
              class={'info-item-value'}>{version.value?.publish_time ? new Date(version.value.publish_time).toLocaleString() : ''}</div>
          </DescriptionsItem>
        </Descriptions>
      </TabPanel>
      <TabPanel label={'日志'} value={2}>
        <MarkdownEditor v-model={content.value}/>
      </TabPanel>
      <TabPanel label={'物料'} value={3}>
        <ReleaseAsset projectId={projectId} scope={'version'} scopeId={versionId}/>
      </TabPanel>
    </Tabs>)
  })

}
