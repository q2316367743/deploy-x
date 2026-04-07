import {useSql} from "@/lib/sql.ts";

export interface DeployStatistics {
  deploy_date: string;
  deploy_count: number;
}

/**
 * 发版/部署频率趋势图 (折线图或柱状图)
 *
 * 价值说明：
 * 这是最核心的图表，用于展示项目在一段时间内的发版节奏。
 *
 * - 可以观察项目是处于密集开发期（频率高）还是维护期（频率低）。
 * - 横轴为时间（按天/周/月聚合），纵轴为部署次数。
 * - 可以帮助团队评估研发效能和版本迭代速度。
 */
export function deployDateCount(projectId: string) {
  return useSql().select<Array<DeployStatistics>>(`
      SELECT strftime('%Y-%m-%d', deploy_time / 1000, 'unixepoch') AS deploy_date,
             COUNT(*)                                              AS deploy_count
      FROM release_deploy
      WHERE project_id = '${projectId}'
        -- 建议限制时间范围，例如最近 30 天或 90 天，避免数据量过大
        AND deploy_time >= strftime('%s', 'now', '-90 days')
      GROUP BY deploy_date
      ORDER BY deploy_date ASC;
  `);
}

export interface DeployVersionInstance {
  id: string;
  deploy_time: string;
  deploy_user: string;
  version: string;
  instance_name: string
}

/**
 * 最近部署流水记录 (列表/时间线)
 *
 * 价值说明：
 * 虽然不是传统图表，但在首页展示最近 5-10 条的操作记录非常有价值，类似于“动态”或“活动流”。
 *
 * - 用户可以快速跳转到最近的部署详情。
 * - 实时监控是否有非预期的发布操作。
 * @param projectId
 */
export function deployVersionInstance(projectId: string) {
  return useSql().select<Array<DeployVersionInstance>>(`
      SELECT d.id,
             d.deploy_time,
             d.deploy_user,
             v.version,
             i.name AS instance_name
      FROM release_deploy d
               JOIN
           release_version v ON d.version_id = v.id
               JOIN
           release_instance i ON d.instance_id = i.id
      WHERE d.project_id = '${projectId}'
      ORDER BY d.deploy_time DESC
      LIMIT 10;
  `)
}