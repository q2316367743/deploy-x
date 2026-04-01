<template>
  <div class="pi-main">
    <t-tabs v-model="page">
      <t-tab-panel label="概览" value="1"/>
      <t-tab-panel label="物料" value="2"/>
      <t-tab-panel label="凭证" value="3"/>
    </t-tabs>
    <div class="pi-main-content">
      <pim-general v-show="page === '1'" :instance-id="instanceId"/>
      <ReleaseAssetEdit v-show="page === '2'" :scope-id="instanceId" scope="instance" :project-id="projectId"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import PimGeneral from "@/pages/project/instance/PiMain/components/PimGeneral.vue";
import ReleaseAssetEdit from "@/pages/project/components/asset/edit/ReleaseAssetEdit.vue";

defineProps({
  instanceId: {
    type: String,
    required: true
  }
});

const route = useRoute();

const projectId = route.params.id as string;

const page = ref('1');
</script>
<style scoped lang="less">
.pi-main {
  height: 100%;

  .pi-main-content {
    height: calc(100% - 48px);
  }
}
</style>
