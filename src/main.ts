import {createApp} from 'vue'
import App from '@/App.vue';
import "@/assets/style/global.less";

import 'virtual:uno.css';
import {createPinia} from "pinia";
import {router} from "@/router";
import {initPath} from "@/global/Constants.ts";
import {useLogSql, useSql} from "@/lib/sql.ts";
import {registerMonacoLanguages} from "@/modules/monaco";

// 注册语言
registerMonacoLanguages();

// 👇 必须在 import monaco 之前设置！
self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    switch (label) {
      case 'json':
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), {
          type: 'module',
        });
      case 'css':
      case 'scss':
      case 'less':
        return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), {
          type: 'module',
        });
      case 'typescript':
      case 'javascript':
        return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), {
          type: 'module',
        });
      default:
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
          type: 'module',
        });
    }
  },
};

Promise.all([
  initPath(),
]).finally(() => {
  // 两个数据库一起合并
  Promise.all([
    useSql().migrate(),
    useLogSql().migrate(),
  ])
    .finally(() => {
      document.getElementById("init")?.remove();
      createApp(App)
        .use(createPinia())
        .use(router)
        .mount('#app')
    });
});