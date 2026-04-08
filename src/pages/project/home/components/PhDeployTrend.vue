<template>
  <t-card title="部署频率趋势" subtitle="最近 90 天" :bordered="false" size="small">
    <div class="chart-container">
      <v-chart v-if="!loading" :option="chartOption" autoresize />
      <div v-else class="loading-placeholder">
        <t-loading text="加载中..." />
      </div>
    </div>
  </t-card>
</template>

<script lang="ts" setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { deployDateCount, type DeployStatistics } from '@/service/statistics';
import MessageUtil from '@/util/model/MessageUtil';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
]);

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const statistics = ref<Array<DeployStatistics>>([]);

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: statistics.value.map((item) => item.deploy_date),
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
  },
  series: [
    {
      name: '部署次数',
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3,
      },
      emphasis: {
        focus: 'series',
      },
      data: statistics.value.map((item) => item.deploy_count),
    },
  ],
}));

const loadData = async () => {
  try {
    loading.value = true;
    statistics.value = await deployDateCount(props.projectId);
  } catch (e) {
    MessageUtil.error('获取部署频率统计失败', e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped lang="less">
.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.loading-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
