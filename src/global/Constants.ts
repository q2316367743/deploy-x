import {appDataDir} from "@tauri-apps/api/path";
import {joinPath} from '@/util/lang/FileUtil';
import {exists, mkdir} from "@tauri-apps/plugin-fs";
import {useColorMode} from "@/hooks/ColorMode.ts";
import {useBoolState} from "@/hooks";
import {logDebug} from "@/lib/log.ts";
import {LocalName} from "@/global/LocalName.ts";
import s0000 from '@/assets/migrate/0000_main.sql?url&no-inline';
import s0001 from '@/assets/migrate/0001_deploy.sql?url&no-inline';
import s1000 from '@/assets/migrate/1000.sql?url&no-inline';

export const APP_ID = 'xyz.esion.deploy-x';
export const APP_NAME = "DeployX";
export const APP_DESC = "DeployX是一个强大的发版软件";
export const APP_AUTHOR = "Esion";
export const APP_GITHUB = 'https://github.com/q2316367743/deploy-x'
export const APP_VERSION = "1.1.0";

export const APP_PASSWORD = "FmH24q7!*DDUcd"

let appData = '';

export const APP_DATA_DIR = () => appData;
export const APP_DATA_ASSET_DIR = () => joinPath(APP_DATA_DIR(), "asset");
export const APP_DATA_DB_DIR = () => joinPath(APP_DATA_DIR(), "db");
export const APP_DATA_STORE_DIR = () => joinPath(APP_DATA_DIR(), "store");


export const APP_DATA_DB_PATH = (fileName: string) => joinPath(APP_DATA_DB_DIR(), `${fileName}.sqlite`);
export const APP_DATA_STORE_PATH = (storeName: string) => joinPath(APP_DATA_STORE_DIR(), `${storeName}.json`);

export const initPath = async () => {
  // 获取应用数据目录
  appData = await appDataDir();
  const items = [
    APP_DATA_ASSET_DIR(),
    APP_DATA_DB_DIR(),
    APP_DATA_STORE_DIR(),
  ]
  for (const dir of items) {
    logDebug("初始化目录：" + dir);
    if (!await exists(dir)) {
      await mkdir(dir, {
        recursive: true
      })
    }
  }

};

// 主要
export const MAIN_MIGRATE_FILES = [{
  file: s0000,
  version: 0
}, {
  file: s0001,
  version: 1
}];
export const LOG_MIGRATE_FILES = [{
  file: s1000,
  version: 0
}];

export const {colorMode, isDark} = useColorMode();

export const [collapsed, toggleCollapsed] = useBoolState(false, LocalName.KEY_COLLAPSED);