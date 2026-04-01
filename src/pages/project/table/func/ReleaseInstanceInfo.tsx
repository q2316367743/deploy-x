import {getReleaseInstanceService, listReleaseVersionByInstanceId, type ReleaseVersionDeploy} from "@/service";
import type {ReleaseInstance} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Card} from "tdesign-vue-next";
import ReleaseAssetList from "@/pages/project/components/asset/list/ReleaseAssetList.vue";

export async function openReleaseInstanceInfo(projectId: string, instanceId: string) {
  const instance = ref<ReleaseInstance | null>();
  const versions = ref<Array<ReleaseVersionDeploy>>([]);

  getReleaseInstanceService(instanceId, projectId)
    .then(res => instance.value = res)
    .catch(e => MessageUtil.error("获取部署实例错误", e));

  listReleaseVersionByInstanceId(instanceId, projectId)
    .then(res => versions.value = res)
    .catch(e => MessageUtil.error("获取部署历史错误", e));

  DrawerPlugin({
    header: false,
    footer: false,
    size: '600px',
    drawerClassName: "release-instance-info",
    default: () => (
      <div class="release-instance-container">
        <Card title={'实例信息'} size={'small'}>
          <div class="info-card">
            <div class="info-card-content">
              <div class="info-item">
                <div class="info-label">名称</div>
                <div class="info-value info-value-with-icon">
                  <div class="i-fluent:cube-24-regular"></div>
                  {instance.value?.name || '-'}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">描述</div>
                <div class="info-value">
                  {instance.value?.desc || '-'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title={'部署历史'} size={'small'}>
          <div class="version-history">
            {versions.value.length === 0 ? (
              <div class="empty-history">暂无部署记录</div>
            ) : (
              versions.value.map((version, index) => (
                <div class="history-item" key={version.id}>
                  <div class={`history-dot ${index === 0 ? 'current' : 'past'}`}></div>
                  <div class="history-version">{version.version}</div>
                  <div class="history-date">
                    {version.deploy_time ? new Date(version.deploy_time).toLocaleString() : '-'}
                  </div>
                  <div class="history-operator">
                    <div class="i-fluent:person-24-regular"></div>
                    {version.deploy_user || '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={'附件列表'} size={'small'}>
          <ReleaseAssetList projectId={projectId} scope={'instance'} scopeId={instanceId}/>
        </Card>
      </div>
    )
  })
}
