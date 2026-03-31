import type {ReleaseDeploy, ReleaseVersion, ReleaseVersionLog, ReleaseAssetMeta, ReleaseInstance} from "@/entity";
import {group, map} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {
  listReleaseAssetMeta,
  listReleaseAssetMetas,
  listReleaseVersionDeploy,
  listReleaseVersionLog
} from "@/service";
import {TabPanel, Tabs} from "tdesign-vue-next";
import VersionTimeline from "@/pages/project/table/components/VersionTimeline.vue";
import AssetPreviewPanel from "@/pages/project/table/components/AssetPreviewPanel.vue";

interface ReleaseDeployInfoProp {
  deploy: ReleaseDeploy;
  instance: ReleaseInstance;
  versions: Array<ReleaseVersion>;
  deployItems: Array<ReleaseDeploy>;
}

export async function openReleaseDeployInfo(prop: ReleaseDeployInfoProp) {
  const {deploy, instance, versions, deployItems} = prop;
  const versionMap = map(versions, "id");
  let startTime = 0;
  const endTime = versionMap.get(deploy.version_id)?.publish_time ?? 0;
  if (!endTime) {
    MessageUtil.error("无法获取版本发布时间");
    return;
  }
  const versionSet = new Set(deployItems
    .filter(e => e.instance_id === deploy.instance_id && e.id !== deploy.id)
    .map(e => e.version_id));
  for (let i = versions.length - 1; i >= 0; i--) {
    const v = versions[i];
    if (!v) continue;
    if (versionSet.has(v.id)) {
      startTime = v.publish_time;
      break;
    }
  }
  const allVersions = await listReleaseVersionDeploy({
    projectId: deploy.project_id,
    deployTimeStart: startTime,
    deployTimeEnd: endTime
  });
  const versionIds = allVersions.map(e => e.id);
  const versionLogMap = ref(new Map<string, ReleaseVersionLog>());
  const assetMetaVersionMap = ref(new Map<string, Array<ReleaseAssetMeta>>());
  const assetMetaInstances = ref(new Array<ReleaseAssetMeta>());

  if (allVersions.length > 0) {
    versionLogMap.value = map(await listReleaseVersionLog(versionIds), 'id');
    assetMetaVersionMap.value = group(await listReleaseAssetMetas(deploy.project_id, 'version', versionIds), 'scope_id');
  }

  assetMetaInstances.value = await listReleaseAssetMeta(deploy.project_id, 'instance', instance.id);

  DrawerPlugin({
    header: false,
    footer: false,
    size: '1080px',
    drawerClassName: "release-deploy-info",
    default: () => (
      <div class={'deploy-info'}>
        <div class="deploy-header">
          <div class="deploy-title">{instance.name} - 部署详情</div>
          <div class="deploy-meta">
            <div class="meta-item">
              <span>版本: {versionMap.get(deploy.version_id)?.version}</span>
            </div>
            <div class="meta-item">
              <span>部署时间: {new Date(deploy.deploy_time).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="deploy-content">
          <Tabs defaultValue={1}>
            <TabPanel label={'更新日志'} value={1}>
              <VersionTimeline versions={allVersions} logMap={versionLogMap.value}/>
            </TabPanel>
            <TabPanel label={'更新物料'} value={2} destroyOnHide>
              <AssetPreviewPanel
                assets={Array.from(assetMetaVersionMap.value.values()).flat()}
                versionAssets={new Map(
                  Array.from(assetMetaVersionMap.value.entries()).map(([versionId, assets]) => [
                    versionId,
                    {version: versionMap.get(versionId)?.version ?? versionId, assets}
                  ])
                )}
              />
            </TabPanel>
            <TabPanel label={'实例物料'} value={3} destroyOnHide>
              <AssetPreviewPanel
                assets={assetMetaInstances.value}
              />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    )
  })
}