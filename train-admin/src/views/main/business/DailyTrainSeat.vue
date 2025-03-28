<template>
  <div class="container">
    <p>
      <a-space>
        <TrainSelect v-model="myParams.trainCode" width="200px"/>
        <a-button type="primary" @click="handleQuery()">查找</a-button>
      </a-space>
    </p>
    <a-table :dataSource="dailyTrainSeats"
             :columns="columns"
             :pagination="pagination"
             @change="handleTableChange"
             :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'col'">
          <span v-for="item in SEAT_COL_ARRAY" :key="item.code">
            <span v-if="item.code === record.col && item.type === record.seatType">
              {{ item.desc }}
            </span>
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'seatType'">
          <span v-for="item in SEAT_TYPE_ARRAY" :key="item.code">
            <span v-if="item.code === record.seatType">
              {{ item.desc }}
            </span>
          </span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="visible" title="每日座位" @ok="handleOk"
             ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="dailyTrainSeat"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="日期" :rules="[{ required: true, message: '日期不能为空' }]">
          <a-date-picker v-model:value="dailyTrainSeat.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        </a-form-item>
        <a-form-item label="车次编号" :rules="[{ required: true, message: '车次编号不能为空' }]">
          <a-input v-model:value="dailyTrainSeat.trainCode"/>
        </a-form-item>
        <a-form-item label="箱序" :rules="[{ required: true, message: '箱序不能为空' }]">
          <a-input v-model:value="dailyTrainSeat.carriageIndex"/>
        </a-form-item>
        <a-form-item label="排号" :rules="[{ required: true, message: '排号不能为空' }]">
          <a-input v-model:value="dailyTrainSeat.row"/>
        </a-form-item>
        <a-form-item label="列号" :rules="[{ required: true, message: '列号不能为空' }]">
          <a-select v-model:value="dailyTrainSeat.col">
            <a-select-option v-for="item in SEAT_COL_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="座位类型" :rules="[{ required: true, message: '座位类型不能为空' }]">
          <a-select v-model:value="dailyTrainSeat.seatType">
            <a-select-option v-for="item in SEAT_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="同车箱座序" :rules="[{ required: true, message: '同车箱座序不能为空' }]">
          <a-input v-model:value="dailyTrainSeat.carriageSeatIndex"/>
        </a-form-item>
        <a-form-item label="售卖情况" :rules="[{ required: true, message: '售卖情况不能为空' }]">
          <a-input v-model:value="dailyTrainSeat.sell"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {notification} from "ant-design-vue";
import axios from "axios";
import TrainSelect from "@/components/TrainSelect.vue";

const SEAT_COL_ARRAY = window.SEAT_COL_ARRAY;
const SEAT_TYPE_ARRAY = window.SEAT_TYPE_ARRAY;
const visible = ref(false);
let dailyTrainSeat = ref({
  id: undefined,
  date: undefined,
  trainCode: undefined,
  carriageIndex: undefined,
  row: undefined,
  col: undefined,
  seatType: undefined,
  carriageSeatIndex: undefined,
  sell: undefined,
  createTime: undefined,
  updateTime: undefined,
});
let loading = ref(false);
let myParams = ref({
  trainCode: undefined
});
const dailyTrainSeats = ref([]);
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
    title: '箱序',
    dataIndex: 'carriageIndex',
    key: 'carriageIndex',
  },
  {
    title: '排号',
    dataIndex: 'row',
    key: 'row',
  },
  {
    title: '列号',
    dataIndex: 'col',
    key: 'col',
  },
  {
    title: '座位类型',
    dataIndex: 'seatType',
    key: 'seatType',
  },
  {
    title: '同车箱座序',
    dataIndex: 'carriageSeatIndex',
    key: 'carriageSeatIndex',
  },
  {
    title: '售卖情况',
    dataIndex: 'sell',
    key: 'sell',
  },
];

const handleOk = () => {
  axios.post("/business/admin/daily-train-seat/save", dailyTrainSeat.value).then((response) => {
    let data = response.data;
    if (data.success) {
      notification.success({description: "保存成功！"});
      visible.value = false;
      handleQuery({
        page: pagination.value.current,
        size: pagination.value.pageSize
      });
    } else {
      notification.error({description: data.message});
    }
  });
};

const handleQuery = (param) => {
  if (!param) {
    param = {
      page: 1,
      size: pagination.value.pageSize
    };
  }
  loading.value = true;
  axios.get("/business/admin/daily-train-seat/query-list", {
    params: {
      page: param.page,
      size: param.size,
      trainCode: myParams.value.trainCode
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      dailyTrainSeats.value = data.content.list;
      // 设置分页控件的值
      pagination.value.current = param.page;
      pagination.value.total = data.content.total;
    } else {
      notification.error({description: data.message});
    }
  });
};

const handleTableChange = (page) => {
  // console.log("看看自带的分页参数都有啥：" + JSON.stringify(page));
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
