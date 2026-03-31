<template>
  <div class="pim-general">
    <wd-cell-group title="基础信息">
      <wd-cell label="实例名称" :value="instance?.name"/>
      <wd-cell label="实例描述" :value="instance?.desc"/>
    </wd-cell-group>
    <wd-cell-group title="部署版本">
      <div v-if="versions.length === 0" class="my-16px">
        <t-empty title="暂无部署版本"/>
      </div>
      <wd-cell v-for="version in versions" :key="version.id" :label="version.version"
               :value="`${version.deploy_user} 于 ${formatDate(version.deploy_time)} 部署`"/>
    </wd-cell-group>
  </div>
</template>
<script lang="ts" setup>
import type {ReleaseInstance} from "@/entity";
import {getReleaseInstanceService, listReleaseVersionByInstanceId, type ReleaseVersionDeploy} from "@/service";
import {formatDate} from "@/util/lang/FormatUtil.ts";

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  }
});

const route = useRoute();

const projectId = route.params.id as string;

const instance = ref<ReleaseInstance>();
const versions = ref<Array<ReleaseVersionDeploy>>([]);

onMounted(() => {
  getReleaseInstanceService(props.instanceId, projectId).then((res) => {
    instance.value = res;
  })
  listReleaseVersionByInstanceId(props.instanceId, projectId).then((res) => {
    versions.value = res;
  })
})
</script>
<style scoped lang="less">
.pim-general {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
