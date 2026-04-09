import {createRouter, createWebHashHistory} from 'vue-router';
import {projectRoute} from "@/router/components/project.ts";
import {hostRoute} from "@/router/components/host.ts";
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "首页",
      path: '/home',
      alias: "/",
      component: () => import('@/pages/home/index.vue'),
    },
    projectRoute,
    hostRoute
  ]
});

