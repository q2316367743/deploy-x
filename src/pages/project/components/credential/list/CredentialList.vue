<template>
  <t-space v-if="list.length > 0" direction="vertical" size="small" class="w-full">
    <wd-cell-group v-for="item in list" :key="item.id" :title="item.name">
      <template #actions>
        <t-button theme="primary" size="small" @click="copyAll(item)">复制全部</t-button>
      </template>
      <wd-cell v-for="sub in item.items" :key="sub.id" :label="sub.key" :help="sub.desc">
        <div class="flex gap-4px">
          <div v-if="sub.value_type === 'password'">********</div>
          <div v-else>{{ sub.value }}</div>
          <t-button size="small" variant="text" shape="square" theme="primary" @click="copyOne(sub)">
            <template #icon>
              <copy-icon/>
            </template>
          </t-button>
        </div>
      </wd-cell>
    </wd-cell-group>
  </t-space>
  <t-empty v-else title="空空如也"></t-empty>
</template>
<script lang="ts" setup>
import {listReleaseCredentials, type ReleaseCredentialView} from "@/service/release/ReleaseCredentialService.ts";
import {CopyIcon} from "tdesign-icons-vue-next";
import {writeText} from "@tauri-apps/plugin-clipboard-manager";
import type {ReleaseCredentialItem} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  instanceId: {
    type: String,
    required: true,
  }
});

const list = computedAsync(() => {
  return listReleaseCredentials(props.projectId, props.instanceId)
}, []);

const copyAll = (target: ReleaseCredentialView) => {
  writeText(target.items.map(e => `${e.key}: ${e.value}`).join("\n")).then(() => {
    MessageUtil.success("已复制到剪切板");
  }).catch(e => {
    MessageUtil.error("复制失败", e);
  });
}
const copyOne = (target: ReleaseCredentialItem) => {
  writeText(target.value).then(() => {
    MessageUtil.success("已复制到剪切板");
  }).catch(e => {
    MessageUtil.error("复制失败", e);
  });
}
</script>
<style scoped lang="less">

</style>
