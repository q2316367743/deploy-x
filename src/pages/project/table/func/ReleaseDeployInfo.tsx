import type {ReleaseDeploy, ReleaseVersion, ReleaseAssetMeta} from "@/entity";
import {group, map} from "@/util";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {
  listReleaseAssetMeta,
  listReleaseAssetMetas,
  listReleaseVersionDeploy, type ReleaseInstanceVersion,
} from "@/service";
import {Card, Tag} from "tdesign-vue-next";
import AssetPreviewPanel from "@/pages/project/table/components/AssetPreviewPanel.vue";
import VersionLogInfo from "@/pages/project/components/VersionLogInfo.vue";

interface ReleaseDeployInfoProp {
  deploy: ReleaseDeploy;
  instance: ReleaseInstanceVersion;
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
  let previousVersion: ReleaseVersion | undefined;
  for (let i = versions.length - 1; i >= 0; i--) {
    const v = versions[i];
    if (!v) continue;
    if (versionSet.has(v.id)) {
      startTime = v.publish_time;
      previousVersion = v;
      break;
    }
  }
  const allVersions = await listReleaseVersionDeploy({
    projectId: deploy.project_id,
    deployTimeStart: startTime,
    deployTimeEnd: endTime
  });
  const versionIds = allVersions.map(e => e.id);
  const assetMetaVersionMap = ref(new Map<string, Array<ReleaseAssetMeta>>());
  const assetMetaInstances = ref(new Array<ReleaseAssetMeta>());

  if (allVersions.length > 0) {
    assetMetaVersionMap.value = group(await listReleaseAssetMetas(deploy.project_id, 'version', versionIds), 'scope_id');
  }

  assetMetaInstances.value = await listReleaseAssetMeta(deploy.project_id, 'instance', instance.instance_id);

  const currentVersion = versionMap.get(deploy.version_id);

  DrawerPlugin({
    header: false,
    footer: false,
    size: '680px',
    drawerClassName: "release-deploy-info",
    default: () => (
      <div class={'deploy-info'}>
        <div class="deploy-header">
          <div class="header-main">
            <div class="deploy-title">
              <span class="title-icon">🚀</span>
              <span class="title-text">{instance.instance_name}</span>
            </div>
            <div class="deploy-path">
              <Tag variant="light" theme="warning">{previousVersion?.version || '初始'}</Tag>
              <span class="path-arrow">→</span>
              <Tag variant="light" theme="success">{currentVersion?.version}</Tag>
            </div>
          </div>
          <Tag variant="outline" theme="primary">
            <span class="time-icon">🕐</span>
            {new Date(deploy.deploy_time).toLocaleString()}
          </Tag>
        </div>

        <div class="deploy-body">
          <Card title="📝 更新日志" bordered shadow>
            <VersionLogInfo versionIds={versionIds}/>
          </Card>

          <Card 
            title="📦 更新物料" 
            bordered 
            shadow
            subtitle={`${Array.from(assetMetaVersionMap.value.values()).flat().length} 项`}
          >
            <AssetPreviewPanel
              assets={Array.from(assetMetaVersionMap.value.values()).flat()}
              versionAssets={new Map(
                Array.from(assetMetaVersionMap.value.entries()).map(([versionId, assets]) => [
                  versionId,
                  {version: versionMap.get(versionId)?.version ?? versionId, assets}
                ])
              )}
            />
          </Card>

          <Card 
            title="🖥️ 实例物料" 
            bordered 
            shadow
            subtitle={`${assetMetaInstances.value.length} 项`}
          >
            <AssetPreviewPanel
              assets={assetMetaInstances.value}
            />
          </Card>
        </div>
      </div>
    )
  })
}
