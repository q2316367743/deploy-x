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
          name: '首页',
          path: 'home',
          component: () => import('@/pages/project/home/index.vue')
        }, {
          name: '部署',
          path: 'deploy',
          component: () => import('@/pages/project/deploy/project-deploy.vue')
        }, {
          name: '版本',
          path: 'version',
          component: () => import('@/pages/project/version/project-version.vue')
        }, {
          name: '实例',
          path: 'instance',
          component: () => import('@/pages/project/instance/project-instance.vue')
        }, {
          name: '设置',
          path: 'setting',
          component: () => import('@/pages/project/setting/project-setting.vue')
        }
      ]
    }
  ]
});

