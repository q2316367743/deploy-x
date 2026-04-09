import type {RouteRecordRaw} from "vue-router";

export const projectRoute: RouteRecordRaw = {
  name: '项目',
  path: '/release/:id',
  component: () => import("@/pages/project/index.vue"),
  children: [
    {
      name: '项目首页',
      path: 'home',
      component: () => import('@/pages/project/home/index.vue')
    }, {
      name: '项目部署',
      path: 'deploy',
      component: () => import('@/pages/project/deploy/project-deploy.vue')
    }, {
      name: '项目版本',
      path: 'version',
      component: () => import('@/pages/project/version/project-version.vue')
    }, {
      name: '项目实例',
      path: 'instance',
      component: () => import('@/pages/project/instance/project-instance.vue')
    }, {
      name: '项目设置',
      path: 'setting',
      component: () => import('@/pages/project/setting/project-setting.vue')
    }
  ]
}