export interface ReleaseVersionLog {

  // 版本 ID
  id: string;

  /**
   * 所属项目
   */
  project_id: string;

  // 日志内容，markdown 格式
  content: string;

}