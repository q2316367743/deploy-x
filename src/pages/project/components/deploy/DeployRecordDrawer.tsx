import type {DeployRecord} from "@/entity";
import {listDeployRecord} from "@/service";
import {openDeployStepListDrawer} from "./DeployStepListDrawer.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Pagination, Table, Button, Tag, type PrimaryTableCol} from "tdesign-vue-next";

const statusThemeMap: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'default',
  running: 'warning',
  success: 'success',
  failed: 'danger',
};

export const openDeployRecordDrawer = (scriptId: string) => {
  const pageNum = ref(1);
  const pageSize = ref(10);
  const loading = ref(false);
  const list = ref(new Array<DeployRecord>());
  const total = ref(0);

  const loadData = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await listDeployRecord(pageNum.value, pageSize.value, scriptId);
      list.value = res.records;
      total.value = res.total;
    } catch (e) {
      MessageUtil.error("获取数据失败", e);
    } finally {
      loading.value = false;
    }
  }

  loadData();

  const columns: Array<PrimaryTableCol> = [
    {colKey: 'id', title: '记录ID', width: 100},
    {colKey: 'instance_id', title: '实例ID', width: 120},
    {colKey: 'deploy_id', title: '部署ID', width: 100},
    {
      colKey: 'status', title: '状态', width: 80, cell: (_h, {row}: { row: DeployRecord }) => (
        <Tag theme={statusThemeMap[row.status]} variant="light">{row.status}</Tag>
      )
    },
    {colKey: 'started_at', title: '开始时间', width: 180},
    {colKey: 'finished_at', title: '结束时间', width: 180},
    {colKey: 'error_summary', title: '错误摘要', ellipsis: true, minWidth: 150},
    {
      colKey: 'action', title: '操作', width: 100, fixed: 'right', cell: (_h, {row}: { row: DeployRecord }) => (
        <Button theme="primary" variant="text" onClick={() => openDeployStepListDrawer(row.id)}>
          查看步骤
        </Button>
      )
    },
  ];

  DrawerPlugin({
    header: "部署记录",
    footer: false,
    size: '800px',
    default: () => <div>
      <Table columns={columns} data={list.value} loading={loading.value} rowKey="id"/>
      <div class={'mt-8px'}>
        <Pagination v-model:current={pageNum.value} pageSize={pageSize.value} total={total.value}
                    onCurrentChange={loadData} onPageSizeChange={loadData}/>
      </div>
    </div>
  })
}
