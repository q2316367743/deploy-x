import type {ReleaseDeploy, ReleaseVersion} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {
  last2VersionByDeploy,
  listReleaseVersionBetween,
  type ReleaseInstanceVersion,
} from "@/service";
import {Button, Card, Tag} from "tdesign-vue-next";
import VersionLogInfo from "@/pages/project/components/VersionLogInfo.vue";
import ReleaseAssetList from "@/pages/project/components/asset/list/ReleaseAssetList.vue";
import VersionTitle from "@/pages/project/components/VersionTitle.vue";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";
import {CalendarIcon, UserIcon} from "tdesign-icons-vue-next";
import CredentialList from "@/pages/project/components/credential/list/CredentialList.vue";

interface ReleaseDeployInfoProp {
  deploy: ReleaseDeploy;
  instance: ReleaseInstanceVersion;
  version: ReleaseVersion;
}

export async function openReleaseDeployInfo(prop: ReleaseDeployInfoProp) {
  const {deploy, instance, version} = prop;

  // 1. 寻找这个实例的在${props.versionId}最后部署的两个版本
  const [maxVersion, minVersion] = await last2VersionByDeploy(instance.instance_id, version.publish_time);
  if (!maxVersion) return MessageUtil.error("系统异常，未找到对应版本");
  // 2. 查询全部的版本
  const versions = await listReleaseVersionBetween(deploy.project_id, maxVersion.publish_time, minVersion?.publish_time);
  //
  const versionIds = versions.map(v => v.id);
  const logRef = ref();

  const copyAllLog = () => {
    console.log(logRef.value)
    logRef.value?.copyAll();
  }
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
              <Tag variant="light" theme="warning">{minVersion?.version || '初始'}</Tag>
              <span class="path-arrow">→</span>
              <Tag variant="light" theme="success">{maxVersion.version}</Tag>
            </div>
          </div>
          {deploy.deploy_user && <Tag variant="light-outline" theme="success">{{
            icon: () => <UserIcon/>,
            default: () => <span>{deploy.deploy_user}</span>
          }}</Tag>}
          <Tag variant="outline" theme="primary">{{
            icon: () => <CalendarIcon/>,
            default: () => <span>{formatDatetime(deploy.deploy_time)}</span>
          }}</Tag>
        </div>

        <div class="deploy-body">
          <Card title="📝 更新日志" bordered shadow>{{
            actions: () => <Button variant={'outline'} theme={'primary'} size={'small'} onClick={copyAllLog}>📋
              复制全部日志</Button>,
            default: () => <VersionLogInfo versionIds={versionIds} ref={logRef}/>
          }}</Card>

          <Card
            title="📦 更新物料"
            bordered
            shadow
          >
            <div class="release-asset-multi">
              {versions.map(version => <div class="version-item">
                <ReleaseAssetList scope="version" scopeId={version.id} projectId={version.project_id}
                                  showEmpty={false}>{{
                  title: () => <VersionTitle version={version}
                                             style={{marginBottom: '8px', marginLeft: '16px', marginTop: '4px'}}/>
                }}</ReleaseAssetList>
              </div>)}
            </div>
          </Card>

          <Card
            title="🖥️ 实例物料"
            bordered
            shadow
          >
            <ReleaseAssetList scope="instance" scopeId={instance.instance_id} projectId={deploy.project_id}/>
          </Card>

          <Card
            title="🔑 实例凭证"
            bordered
            shadow
          >
            <CredentialList instanceId={instance.instance_id} projectId={deploy.project_id}/>
          </Card>
        </div>
      </div>
    )
  })
}
