import {createRouter, createWebHashHistory} from 'vue-router';
// 引入路由

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "首页",
      path: '/',
      component: () => import('@/pages/home/index.vue'),
    },
    {
      name: '项目',
      path: '/release/:id',
      component: () => import("@/pages/project/index.vue"),
      children: [
        {
          name: '项目首页',
          path: 'home',
          component: () => import('@/pages/project/project-home/index.vue')
        },
      ]
    }
  ]
});

