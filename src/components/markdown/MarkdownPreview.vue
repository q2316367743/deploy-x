<template>
  <div class="markdown-preview">
    <div v-html="content"></div>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  content: String
})
</script>
<style scoped lang="less">

</style>
