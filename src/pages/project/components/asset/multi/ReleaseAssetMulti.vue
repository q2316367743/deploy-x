<template>
  <div class="release-asset-multi">
    <div v-for="version in versions" :key="version.id" class="version-item">
      <div class="title">
        {{ version.version }} -- {{ formatDatetime(version.publish_time) }} -- {{ version.publish_user }}
      </div>
      <ReleaseAssetList scope="version" :scope-id="version.id" :project-id="version.project_id"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import MessageUtil from "@/util/model/MessageUtil.ts";
import {last2VersionByDeploy, listReleaseVersionBetween} from "@/service";
import type {ReleaseVersion} from "@/entity";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";
import ReleaseAssetList from "@/pages/project/components/asset/list/ReleaseAssetList.vue";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  instanceId: {
    type: String,
    required: true,
  },
  publishTime: {
    type: Number,
    required: true,
  },
});


const versions = ref<Array<ReleaseVersion>>([]);
const loading = ref(false);

const loadAssets = async () => {
  loading.value = true;
  try {

    // 1. 寻找这个实例的在${props.versionId}最后部署的两个版本
    const [maxPublishTime, minPublishTime] = await last2VersionByDeploy(props.instanceId, props.publishTime);
    if (!maxPublishTime) return;
    versions.value = await listReleaseVersionBetween(props.projectId, maxPublishTime, minPublishTime);
  } catch (error) {
    MessageUtil.error("获取附件列表失败", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadAssets);
</script>
<style scoped lang="less">

</style>
