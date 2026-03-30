<template>
  <markdown-editor v-if="init" v-model="content"/>
  <loading-result v-else/>
</template>
<script lang="ts" setup>
import {getReleaseVersionLog, saveReleaseVersionLog} from "@/service";

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

const init = ref(false);
const content = ref('');

onMounted(async () => {
  try {
    // 获取版本日志内容
    const res = await getReleaseVersionLog(props.versionId);
    content.value = res?.content || '';

    // 监听内容变化并保存
    watchDebounced(content, val => {
      saveReleaseVersionLog(props.versionId, val);
    }, {
      debounce: 300
    })
  } finally {
    init.value = true;
  }
});
</script>
<style scoped lang="less">

</style>
