<template>
  <app-tool-layout title="实例">
    <div class="project-instance">
      <pi-aside v-model="instanceId"></pi-aside>
      <div class="pi-content">
        <pi-main v-if="instanceId && show" :instance-id="instanceId"/>
        <empty-result v-else title="请在左侧选择实例"/>
      </div>
    </div>
  </app-tool-layout>
</template>
<script lang="ts" setup>
import PiAside from "@/pages/project/instance/PiAside/PiAside.vue";
import PiMain from "@/pages/project/instance/PiMain/PiMain.vue";

const instanceId = ref('');
const show = ref(true);

watch(instanceId, (n, o) => {
  if (n && o) {
    show.value = false;
    nextTick(() => {
      show.value = true;
    })
  }
})
</script>
<style scoped lang="less">
.project-instance {
  margin: 8px;
  height: calc(100vh - 74px);
  width: calc(100% - 16px);
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  box-shadow: var(--td-shadow-1);
  display: flex;
  overflow: hidden;


  .pi-content {
    width: calc(100% - 232px);
  }
}
</style>
