import {createRouter, createWebHashHistory} from 'vue-router';
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
    {
      name: '项目',
      path: '/release/:id',
      component: () => import("@/pages/project/index.vue"),
      children: [
        {
          name: '项目首页',
          path: 'home',
          component: () => import('@/pages/project/home/index.vue')
        }, {
          name: '项目一张表',
          path: 'table',
          component: () => import('@/pages/project/table/project-table.vue')
        }, {
          name: '版本管理',
          path: 'version',
          component: () => import('@/pages/project/version/project-version.vue')
        }, {
          name: '实例管理',
          path: 'instance',
          component: () => import('@/pages/project/instance/project-instance.vue')
        }, {
          name: '项目设置',
          path: 'setting',
          component: () => import('@/pages/project/setting/project-setting.vue')
        }
      ]
    }
  ]
});

