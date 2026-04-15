import type {DeployLog, DeployStep} from "@/entity";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {Descriptions, DescriptionsItem, type PrimaryTableCol, Steps, Table, Tag} from "tdesign-vue-next";
import {nextTick, onBeforeUnmount} from "vue";
import {deployLogList, deployStepList} from "@/modules/deploy";
import type {TdStepItemProps} from "tdesign-vue-next/es/steps/type";
import {formatDatetime} from "@/util/lang/FormatUtil.ts";

const stepTypeLabel: Record<string, string> = {
  local_build: '本地构建',
  local_post: '本地推送',
  remote_pre: '部署前执行',
  remote_deploy: '远程部署',
  remote_post: '部署后执行',
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
  const currentStep = ref<DeployStep>();
  const logs = ref(new Array<DeployLog>());
  const logLoading = ref(false);
  const pollingTimer = ref<number | null>(null);
  const tableRef = ref();

  const loadList = () => {
    if (loading.value) return;
    loading.value = true;
    deployStepList(recordId)
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
    deployLogList(stepId)
      .then(res => {
        logs.value = res;
        scrollToBottom();
      })
      .catch(e => {
        MessageUtil.error("获取日志失败", e);
      })
      .finally(() => {
        logLoading.value = false;
        // 如果当前选中步骤是 pending 或 running，开始轮询
        const step = list.value.find(s => s.id === stepId);
        if (step?.status === 'pending' || step?.status === 'running') {
          startPolling(stepId);
        }
      })
  }

  const startPolling = (stepId: string) => {
    stopPolling();
    pollingTimer.value = window.setInterval(async () => {
      try {
        // 先刷新步骤列表
        const steps = await deployStepList(recordId);
        list.value = steps;
        const current = steps.find(s => s.id === stepId);
        currentStep.value = current || undefined;

        // 如果没有任何步骤是 pending 或 running，停止轮询
        const hasActiveStep = steps.some(s => s.status === 'pending' || s.status === 'running');
        // 始终刷新日志
        logs.value = await deployLogList(stepId);
        scrollToBottom();

        if (!hasActiveStep) {
          stopPolling();
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

  const scrollToBottom = () => {
    if (logs.value.length === 0) return;
    nextTick(() => {
      tableRef.value?.scrollToElement({rowIndex: logs.value.length - 1});
    });
  }

  onBeforeUnmount(stopPolling);

  const selectStep = (step: DeployStep) => {
    currentStep.value = step;
    loadLogs(step.id);
  }

  loadList();

  const logColumns: Array<PrimaryTableCol<DeployLog>> = [
    {colKey: 'line_num', title: '行号', width: 80},
    {
      colKey: 'stream', title: '流', width: 80, cell: (_h, {row}) => (
        <Tag theme={row.stream === 'stderr' ? 'danger' : 'default'} variant="light">{row.stream}</Tag>
      )
    },
    {colKey: 'content', title: '内容', ellipsis: true, minWidth: 300},
    {colKey: 'created_at', title: '时间', width: 180, cell: (_h, {row}) => (
      <span>{formatDatetime(row.created_at)}</span>
      )},
  ];

  const currentStepId = computed({
    get: () => {
      return currentStep.value?.id || ''
    },
    set: (res) => {
      const t = list.value.find(s => s.id === res);
      if (t) {
        selectStep(t);
      }
    }
  })

  DrawerPlugin({
    header: '部署步骤',
    footer: false,
    closeBtn: true,
    size: '100vw',
    default: () => (
      <div class="deploy-step-drawer">
        {/* 步骤条 */}
        <Steps
          options={list.value.map((step) => ({
            title: stepTypeLabel[step.step_type] || step.step_type,
            value: step.id,
            icon: () => <Tag theme={statusThemeMap[step.status]} variant="light"
                             size="small">{statusLabel[step.status]}</Tag>,
            content: step.started_at ? (
              <div style="font-size: 12px; color: #999;">
                {step.started_at} {step.finished_at ? `→ ${step.finished_at}` : ''}
              </div>
            ) : undefined,
          } as TdStepItemProps))}
          v-model={currentStepId.value}
          theme="dot"
          style="margin-bottom: 16px;"
        />

        {/* 当前步骤详情 */}
        {currentStep.value && (
          <Descriptions
            bordered
            column={3}
            style="margin-bottom: 16px;"
          >
            {[
              {label: '步骤名称', content: stepTypeLabel[currentStep.value.step_type] || currentStep.value.step_name},
              {
                label: '状态',
                content: () => <Tag
                  theme={currentStep.value?.status ? statusThemeMap[currentStep.value.status] : undefined}
                  variant="light">{currentStep.value?.status ? statusLabel[currentStep.value.status] : ''}</Tag>
              },
              {label: '开始时间', content: currentStep.value.started_at || '-'},
              {label: '结束时间', content: currentStep.value.finished_at || '-'},
              ...(currentStep.value.error ? [{label: '错误信息', content: currentStep.value.error}] : []),
            ].map(e => <DescriptionsItem label={e.label} key={e.label} content={(typeof e.content === 'string' ? e.content : e.content()) as any}/>)}
          </Descriptions>
        )}

        {/* 日志表格 */}
        <Table
          ref={tableRef}
          columns={logColumns as any}
          data={logs.value}
          loading={logLoading.value}
          rowKey="id"
          scroll={{
            type: 'virtual',
            isFixedRowHeight: true,
            rowHeight: 49
          }}
          bordered={true}
          maxHeight={'calc(100vh - 310px)'}
        />
      </div>
    )
  })
}
