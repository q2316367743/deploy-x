<template>
  <div class="pv-main">
    <t-tabs v-model="active">
      <t-tab-panel label="概览" value="1"></t-tab-panel>
      <t-tab-panel label="日志" value="2"></t-tab-panel>
      <t-tab-panel label="物料" value="3"></t-tab-panel>
    </t-tabs>
    <div class="pvm-content">
      <PvmGeneral v-if="active === '1'" :project-id="projectId" :version-id="versionId"/>
      <PvmLog v-else-if="active === '2'" :project-id="projectId" :version-id="versionId"/>
      <ReleaseAssetEdit v-else-if="active === '3'" :scope-id="versionId" scope="version" :project-id="projectId"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import PvmLog from "@/pages/project/version/PvMain/components/PvmLog.vue";
import PvmGeneral from "@/pages/project/version/PvMain/components/PvmGeneral.vue";
import ReleaseAssetEdit from "@/pages/project/components/asset/edit/ReleaseAssetEdit.vue";

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

const active = ref('1')

onMounted(() => {
  console.log(props.versionId, Date.now().toString());
})

</script>
<style scoped lang="less">
.pv-main {
  width: 100%;
  height: 100%;

  .pvm-content {
    height: calc(100% - 48px);
    overflow: auto;
  }
}
</style>
