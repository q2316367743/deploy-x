import type {RouteRecordRaw} from "vue-router";

export const hostRoute: RouteRecordRaw = {
  name: '主机管理',
  path: '/host',
  component: () => import("@/pages/host/index.vue"),
  children: [{
    name: "主机列表",
    path: 'home',
    component: () => import("@/pages/host/home/HostHome.vue"),
  }, {
    name: '凭证列表',
    path: "credential",
    component: () => import("@/pages/host/credential/HomeCredential.vue")
  }]
}