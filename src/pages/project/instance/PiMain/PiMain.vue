<template>
  <div>Instance Main: {{instanceId}}</div>
</template>
<script lang="ts" setup>
defineProps({
  instanceId: {
    type: String,
  }
});
</script>
<style scoped lang="less">

</style>
