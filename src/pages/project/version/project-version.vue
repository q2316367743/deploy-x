<template>
  <app-tool-layout title="版本">
    <div class="project-version">
      <pv-aside v-model="versionId"/>
      <div class="pv-content">
        <pv-main v-if="versionId && show" :version-id="versionId" :project-id="projectId"/>
        <empty-result v-else title="请在左侧选择版本"/>
      </div>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import PvAside from "@/pages/project/version/components/PvAside.vue";
import PvMain from "@/pages/project/version/PvMain/PvMain.vue";

const route = useRoute();

const projectId = route.params.id as string;

const versionId = ref('');
const show = ref(true);

watch(versionId, (n, o) => {
  if (n && o) {
    show.value = false;
    nextTick(() => {
      show.value = true;
    })
  }
})

</script>
<style scoped lang="less">
.project-version {
  margin: 8px;
  height: calc(100vh - 74px);
  width: calc(100% - 16px);
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  box-shadow: var(--td-shadow-1);
  display: flex;
  overflow: hidden;

  .pv-content {
    width: calc(100% - 232px);
  }
}
</style>
