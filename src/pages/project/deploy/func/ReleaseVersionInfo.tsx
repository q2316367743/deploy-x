import {Button, Card} from "tdesign-vue-next";
import {getReleaseVersionService} from "@/service";
import type {ReleaseVersion} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import ReleaseAssetList from "@/pages/project/components/asset/list/ReleaseAssetList.vue";
import VersionLogInfo from "@/pages/project/components/VersionLogInfo.vue";

export async function openReleaseVersionInfo(projectId: string, versionId: string) {
  const version = ref<ReleaseVersion | null>();

  getReleaseVersionService(versionId, projectId)
    .then(res => version.value = res)
    .catch(e => MessageUtil.error("获取版本错误", e));


  const compressing = ref(false);
  const compressRef = ref();
  const handleCompress = () => {
    if (compressing.value) {
      return;
    }
    (compressRef.value?.compress(version.value?.version || Date.now()) as Promise<void>)
      .then(() => {
        MessageUtil.success("压缩完成");
      }).catch(e => MessageUtil.error("压缩失败", e))
      .finally(() => {
        compressing.value = false;
      });
  }

  DrawerPlugin({
    header: false,
    footer: false,
    size: '600px',
    drawerClassName: "release-version-info",
    default: () => (
      <div class="release-version-container">
        <Card title={'版本信息'} size={'small'}>
          <div class="info-card">
            <div class="info-card-content">
              <div class="info-item">
                <div class="info-label">版本号</div>
                <div class="info-value">
                  {version.value?.version || '-'}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">发布人</div>
                <div class="info-value info-value-with-icon">
                  <div class="i-fluent:person-24-regular"></div>
                  {version.value?.publish_user || '-'}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">发布时间</div>
                <div class="info-value info-value-with-icon">
                  <div class="i-fluent:calendar-24-regular"></div>
                  {version.value?.publish_time ? new Date(version.value.publish_time).toLocaleString() : '-'}
                </div>
              </div>
            </div>
          </div>
        </Card>


        <Card title={'版本日志'} size={'small'}>
          <VersionLogInfo versionIds={[versionId]} showTitle={false}/>
        </Card>
        <Card title={'附件列表'} size={'small'}>{{
          actions: () => <Button variant={'outline'} size={'small'} loading={compressing.value}
                                 onClick={handleCompress}>{compressing.value ? '压缩中...' : '下载附件'}</Button>,
          default: () => <ReleaseAssetList projectId={projectId} scope={'version'} scopeId={versionId} ref={compressRef}/>
        }}</Card>
      </div>
    )
  })
}
