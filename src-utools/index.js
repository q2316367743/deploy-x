const inject = require("./inject");

// 注入命令
window.__TAURI_INTERNALS__ = inject('main');