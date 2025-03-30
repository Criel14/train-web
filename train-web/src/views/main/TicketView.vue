<template>
  <div class="container">
    <p>
      <a-space>
        <a-date-picker v-model:value="myParams.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        <TrainSelect v-model="myParams.trainCode" width="200px"/>
        <StationSelect v-model="myParams.start" placeholder="请选择出发站" width="200px"/>
        <StationSelect v-model="myParams.end" placeholder="请选择到达站" width="200px"/>
        <a-button type="primary" @click="handleQuery()">查找</a-button>
      </a-space>
    </p>
    <a-table :dataSource="dailyTrainTickets"
             :columns="columns"
             :pagination="pagination"
             @change="handleTableChange"
             :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'stations'">
          {{ record.start }} - <br> {{ record.end }}
        </template>
        <template v-else-if="column.dataIndex === 'times'">
          {{ record.startTime }} - <br> {{ record.endTime }}
        </template>
        <template v-else-if="column.dataIndex === 'duration'">
          {{ calDuration(record.startTime, record.endTime) }}
          <div v-if="record.startTime.replaceAll(':', '') >= record.endTime.replaceAll(':', '')">
            次日到达
          </div>
          <div v-else>
            当日到达
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'ydz'">
          <div v-if="record.ydz >= 0">
            {{ record.ydz }}张 / {{ record.ydzPrice }}元
          </div>
          <div v-else>
            --
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'edz'">
          <div v-if="record.edz >= 0">
            {{ record.edz }}张 / {{ record.edzPrice }}元
          </div>
          <div v-else>
            --
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'rw'">
          <div v-if="record.rw >= 0">
            {{ record.rw }}张 / {{ record.rwPrice }}元
          </div>
          <div v-else>
            --
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'yw'">
          <div v-if="record.yw >= 0">
            {{ record.yw }}张 / {{ record.ywPrice }}元
          </div>
          <div v-else>
            --
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {notification} from "ant-design-vue";
import axios from "axios";
import TrainSelect from "@/components/TrainSelect.vue";
import StationSelect from "@/components/StationSelect.vue";
import dayjs from "dayjs";

const visible = ref(false);
let dailyTrainTicket = ref({
  id: undefined,
  date: undefined,
  trainCode: undefined,
  start: undefined,
  startPinyin: undefined,
  startTime: undefined,
  startIndex: undefined,
  end: undefined,
  endPinyin: undefined,
  endTime: undefined,
  endIndex: undefined,
  ydz: undefined,
  ydzPrice: undefined,
  edz: undefined,
  edzPrice: undefined,
  rw: undefined,
  rwPrice: undefined,
  yw: undefined,
  ywPrice: undefined,
  createTime: undefined,
  updateTime: undefined,
});
let loading = ref(false);

let myParams = ref({
  date: undefined,
  trainCode: undefined,
  start: undefined,
  end: undefined
})

const dailyTrainTickets = ref([]);
// 分页的三个属性名是固定的
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
});
const columns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '车次编号',
    dataIndex: 'trainCode',
    key: 'trainCode',
  },
  {
    title: '出发站 - 到达站',
    dataIndex: 'stations',
    key: 'stations',
  },
  {
    title: '出发时间 - 到达时间',
    dataIndex: 'times',
    key: 'times',
  },
  {
    title: '历时',
    dataIndex: 'duration',
    key: 'duration',
  },
  {
    title: '一等座余票/票价',
    dataIndex: 'ydz',
    key: 'ydz',
  },
  {
    title: '二等座余票/票价',
    dataIndex: 'edz',
    key: 'edz',
  },
  {
    title: '软卧余票/票价',
    dataIndex: 'rw',
    key: 'rw',
  },
  {
    title: '硬卧余票/票价',
    dataIndex: 'yw',
    key: 'yw',
  },
];

const handleQuery = (param) => {
  if (!param) {
    param = {
      page: 1,
      size: pagination.value.pageSize
    };
  }
  loading.value = true;
  axios.get("/business/daily-train-ticket/query-list", {
    params: {
      page: param.page,
      size: param.size,
      date: myParams.value.date,
      trainCode: myParams.value.trainCode,
      start: myParams.value.start,
      end: myParams.value.end
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      dailyTrainTickets.value = data.content.list;
      // 设置分页控件的值
      pagination.value.current = param.page;
      pagination.value.total = data.content.total;
    } else {
      notification.error({description: data.message});
    }
  });
};

const calDuration = (startTime, endTime) => {
  let diff = dayjs(endTime, 'HH:mm:ss').diff(dayjs(startTime, 'HH:mm:ss'), 'seconds');
  return dayjs('00:00:00', 'HH:mm:ss').second(diff).format('HH:mm:ss');
};

const handleTableChange = (page) => {
  pagination.value.pageSize = page.pageSize;
  handleQuery({
    page: page.current,
    size: page.pageSize
  });
};

onMounted(() => {
  handleQuery({
    page: 1,
    size: pagination.value.pageSize
  });
});


</script>

<style scoped>
.container {
  height: 84vh;
}

</style>
