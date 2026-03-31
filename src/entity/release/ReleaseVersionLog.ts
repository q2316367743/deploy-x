export type VersionLogType =
  // 新增/add
  | 1
  // 修复/fixed
  | 2
  // 优化/optimized
  | 3
  // 其他/other
  | 4
  // 删除/deleted
  | 5
  ;

export const VersionLogTypeText: Record<VersionLogType, string> = {
  1: '新增',
  2: '修复',
  3: '优化',
  4: '其他',
  5: '删除',
};
export const VersionLogTypeColor: Record<VersionLogType, { color: string, backgroundColor: string }> = {
  1: { color: 'white', backgroundColor: '#55a630' },
  2: { color: 'white', backgroundColor: '#40a9ff' },
  3: { color: 'white', backgroundColor: '#2db7f5' },
  4: { color: 'white', backgroundColor: '#3f3d56' },
  5: { color: 'white', backgroundColor: '#ff4d4f' },

};

export interface VersionLogContent {
  type: VersionLogType;
  content: string;
}

export interface ReleaseVersionLog {

  // 版本 ID
  id: string;

  /**
   * 所属项目
   */
  project_id: string;

  // 日志内容，JSON字符串
  content: string;

}

export interface ReleaseVersionLogView {

  // 版本 ID
  id: string;

  /**
   * 所属项目
   */
  project_id: string;

  content: Array<VersionLogContent>;

}

export function versionLogViewToBase(view: ReleaseVersionLogView): ReleaseVersionLog {
  return {
    ...view,
    content: JSON.stringify(view.content),
  }
}

export function versionLogBaseToView(base: ReleaseVersionLog): ReleaseVersionLogView {
  return {
    ...base,
    content: JSON.parse(base.content),
  }
}