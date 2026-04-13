import {listDeployStep, listDeployLog} from "@/service";
import type {DeployStep, DeployLog} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Steps, Descriptions, Table, Tag} from "tdesign-vue-next";
import {onBeforeUnmount} from "vue";

const stepTypeLabel: Record<string, string> = {
  local_build: '本地构建',
  local_post: '本地后置',
  remote_pre: '远程前置',
  sftp_upload: '文件上传',
  remote_post: '远程后置',
};

const statusThemeMap: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'default',
  running: 'warning',
  success: 'success',
  failed: 'danger',
  skipped: 'default',
};

const statusLabel: Record<string, string> = {
  pending: '等待中',
  running: '执行中',
  success: '成功',
  failed: '失败',
  skipped: '已跳过',
};

export const openDeployStepListDrawer = (recordId: string) => {
  const list = ref(new Array<DeployStep>());
  const loading = ref(false);
  const currentStep = ref<DeployStep | null>(null);
  const logs = ref(new Array<DeployLog>());
  const logLoading = ref(false);
  const pollingTimer = ref<number | null>(null);

  const loadList = () => {
    if (loading.value) return;
    loading.value = true;
    listDeployStep(recordId)
      .then(res => {
        list.value = res;
        // 默认选中最新的非 pending 步骤，如果都是 pending 则选第一个
        const runningOrLatest = res.find(s => s.status !== 'pending') || res[0];
        if (runningOrLatest) {
          currentStep.value = runningOrLatest;
          loadLogs(runningOrLatest.id);
        }
      })
      .catch(e => {
        MessageUtil.error("获取失败", e);
      })
      .finally(() => {
        loading.value = false;
      })
  }

  const loadLogs = (stepId: string) => {
    stopPolling();
    logLoading.value = true;
    listDeployLog(stepId)
      .then(res => {
        logs.value = res;
      })
      .catch(e => {
        MessageUtil.error("获取日志失败", e);
      })
      .finally(() => {
        logLoading.value = false;
        // 如果当前选中步骤是 running，开始轮询
        const step = list.value.find(s => s.id === stepId);
        if (step?.status === 'running') {
          startPolling(stepId);
        }
      })
  }

  const startPolling = (stepId: string) => {
    stopPolling();
    pollingTimer.value = window.setInterval(async () => {
      try {
        // 先刷新步骤列表
        const steps = await listDeployStep(recordId);
        list.value = steps;
        const current = steps.find(s => s.id === stepId);
        currentStep.value = current || null;

        // 如果不再是 running，停止轮询
        if (current?.status !== 'running') {
          stopPolling();
          // 刷新日志
          const res = await listDeployLog(stepId);
          logs.value = res;
        } else {
          // 继续轮询日志
          const res = await listDeployLog(stepId);
          logs.value = res;
        }
      } catch (e) {
        stopPolling();
        MessageUtil.error("轮询失败", e);
      }
    }, 2000);
  }

  const stopPolling = () => {
    if (pollingTimer.value !== null) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
    }
  }

  onBeforeUnmount(stopPolling);

  const selectStep = (step: DeployStep) => {
    currentStep.value = step;
    loadLogs(step.id);
  }

  loadList();

  const logColumns = [
    {colKey: 'line_num', title: '行号', width: 80},
    {colKey: 'stream', title: '流', width: 80, cell: ({row}: {row: DeployLog}) => (
      <Tag theme={row.stream === 'stderr' ? 'danger' : 'default'} variant="light">{row.stream}</Tag>
    )},
    {colKey: 'content', title: '内容', ellipsis: true, minWidth: 300},
    {colKey: 'created_at', title: '时间', width: 180},
  ];

  DrawerPlugin({
    header: '部署步骤',
    footer: false,
    default: () => (
      <div class="deploy-step-drawer">
        {/* 步骤条 */}
        <Steps
          options={list.value.map((step, index) => ({
            title: stepTypeLabel[step.step_type] || step.step_type,
            icon: <Tag theme={statusThemeMap[step.status]} variant="light" size="small">{statusLabel[step.status]}</Tag>,
            content: step.started_at ? (
              <div style="font-size: 12px; color: #999;">
                {step.started_at} {step.finished_at ? `→ ${step.finished_at}` : ''}
              </div>
            ) : undefined,
          }))}
          current={currentStep.value ? list.value.findIndex(s => s.id === currentStep.value?.id) : 0}
          onCurrentChange={(index: number) => {
            if (list.value[index]) selectStep(list.value[index]);
          }}
          theme="dot"
          readonly
          style="margin-bottom: 16px;"
        />

        {/* 当前步骤详情 */}
        {currentStep.value && (
          <Descriptions
            data={[
              {label: '步骤名称', content: stepTypeLabel[currentStep.value.step_type] || currentStep.value.step_name},
              {label: '状态', content: <Tag theme={statusThemeMap[currentStep.value.status]} variant="light">{statusLabel[currentStep.value.status]}</Tag>},
              {label: '开始时间', content: currentStep.value.started_at || '-'},
              {label: '结束时间', content: currentStep.value.finished_at || '-'},
              ...(currentStep.value.error ? [{label: '错误信息', content: currentStep.value.error}] : []),
            ]}
            bordered
            column={3}
            style="margin-bottom: 16px;"
          />
        )}

        {/* 日志表格 */}
        <Table
          columns={logColumns}
          data={logs.value}
          loading={logLoading.value}
          rowKey="id"
          maxHeight={300}
        />
      </div>
    )
  })
}
