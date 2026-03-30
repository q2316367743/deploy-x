<template>
  <div v-if="version" class="pvm-general">
    <wd-cell-group title="基础信息">
      <wd-cell label="版本名称" :value="version.version"/>
      <wd-cell label="发布时间" :value="formatDate(version.publish_time)"/>
      <wd-cell label="发布人" :value="version.publish_user"/>
    </wd-cell-group>
    <wd-cell-group title="部署信息">
      <div v-if="instances.length === 0" class="my-16px">
        <t-empty class="my-16px">暂无部署信息</t-empty>
      </div>
      <wd-cell v-for="instance in instances" :key="instance.id" :label="instance.name"
               :value="`${instance.deploy_user} 于 ${formatDate(instance.deploy_time)} 部署`"/>
    </wd-cell-group>
  </div>
  <loading-result v-else/>
</template>
<script lang="ts" setup>
import type {ReleaseVersion} from "@/entity";
import {
  getReleaseVersionService,
  listReleaseDeployByVersionId,
  type ReleaseDeployInstanceVersion,
} from "@/service";
import {formatDate} from "@/util/lang/FormatUtil.ts";

const props = defineProps({
  versionId: {
    type: String,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
});

const version = ref<ReleaseVersion>();
const instances = ref<Array<ReleaseDeployInstanceVersion>>([]);

const initVersion = async () => {
  version.value = await getReleaseVersionService(props.versionId, props.projectId);
};
const initInstances = async () => {
  instances.value = await listReleaseDeployByVersionId(props.projectId, props.versionId);
};

onMounted(() => {
  initVersion();
  initInstances();
})
</script>
<style scoped lang="less">
.pvm-general {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
