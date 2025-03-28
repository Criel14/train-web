<template>
  <div class="container">
    <p>
      <a-space>
        <a-date-picker v-model:value="myParams.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        <TrainSelect v-model="myParams.code" width="200px"/>
        <a-button type="primary" @click="handleQuery()">查找</a-button>
        <a-button type="primary" @click="onAdd">新增</a-button>
        <a-button type="primary" @click="onClickGenDaily">手动生成车次相关信息</a-button>
      </a-space>
    </p>
    <a-table :dataSource="dailyTrains"
             :columns="columns"
             :pagination="pagination"
             @change="handleTableChange"
             :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-space>
            <a @click="onEdit(record)">编辑</a>
            <a-popconfirm
                title="删除后不可恢复，确认删除?"
                @confirm="onDelete(record)"
                ok-text="确认" cancel-text="取消">
              <a style="color: red">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'type'">
          <span v-for="item in TRAIN_TYPE_ARRAY" :key="item.code">
            <span v-if="item.code === record.type">
              {{ item.desc }}
            </span>
          </span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="visible" title="每日车次" @ok="handleOk"
             ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="dailyTrain"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="日期" :rules="[{ required: true, message: '日期不能为空' }]">
          <a-date-picker v-model:value="dailyTrain.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        </a-form-item>
        <a-form-item label="车次编号" :rules="[{ required: true, message: '车次编号不能为空' }]">
          <TrainSelect v-model="dailyTrain.code" @change="onChangeTrainCode"/>
        </a-form-item>
        <a-form-item label="车次类型" :rules="[{ required: true, message: '车次类型不能为空' }]">
          <a-select v-model:value="dailyTrain.type">
            <a-select-option v-for="item in TRAIN_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="始发站" :rules="[{ required: true, message: '始发站不能为空' }]">
          <a-input v-model:value="dailyTrain.start"/>
        </a-form-item>
        <a-form-item label="始发站拼音" :rules="[{ required: true, message: '始发站拼音不能为空' }]">
          <a-input v-model:value="dailyTrain.startPinyin"/>
        </a-form-item>
        <a-form-item label="出发时间" :rules="[{ required: true, message: '出发时间不能为空' }]">
          <a-time-picker v-model:value="dailyTrain.startTime" valueFormat="HH:mm:ss" placeholder="请选择时间"/>
        </a-form-item>
        <a-form-item label="终点站" :rules="[{ required: true, message: '终点站不能为空' }]">
          <a-input v-model:value="dailyTrain.end"/>
        </a-form-item>
        <a-form-item label="终点站拼音" :rules="[{ required: true, message: '终点站拼音不能为空' }]">
          <a-input v-model:value="dailyTrain.endPinyin"/>
        </a-form-item>
        <a-form-item label="到站时间" :rules="[{ required: true, message: '到站时间不能为空' }]">
          <a-time-picker v-model:value="dailyTrain.endTime" valueFormat="HH:mm:ss" placeholder="请选择时间"/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="genDailyVisible" title="生成车次" @ok="handleGenDailyOk"
             :confirm-loading="genDailyLoading" ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="genDaily"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="日期">
          <a-date-picker v-model:value="genDaily.date" style="width: 300px;" placeholder="请选择日期"/>
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
import dayjs from "dayjs";

const TRAIN_TYPE_ARRAY = window.TRAIN_TYPE_ARRAY;
let visible = ref(false);
let loading = ref(false);
let genDailyVisible = ref(false);
let genDailyLoading = ref(false);
let genDaily = ref({
  date: undefined
});
let dailyTrain = ref({
  id: undefined,
  date: undefined,
  code: undefined,
  type: undefined,
  start: undefined,
  startPinyin: undefined,
  startTime: undefined,
  end: undefined,
  endPinyin: undefined,
  endTime: undefined,
  createTime: undefined,
  updateTime: undefined,
});
let myParams = ref({
  code: undefined,
  date: undefined,
})
const dailyTrains = ref([]);
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
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '车次类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '始发站',
    dataIndex: 'start',
    key: 'start',
  },
  {
    title: '始发站拼音',
    dataIndex: 'startPinyin',
    key: 'startPinyin',
  },
  {
    title: '出发时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '终点站',
    dataIndex: 'end',
    key: 'end',
  },
  {
    title: '终点站拼音',
    dataIndex: 'endPinyin',
    key: 'endPinyin',
  },
  {
    title: '到站时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  {
    title: '操作',
    dataIndex: 'operation'
  }
];

const onAdd = () => {
  dailyTrain.value = {};
  visible.value = true;
};

const onEdit = (record) => {
  dailyTrain.value = JSON.parse(JSON.stringify(record));
  visible.value = true;
};

const onClickGenDaily = () => {
  genDailyVisible.value = true;
};

const onDelete = (record) => {
  axios.delete("/business/admin/daily-train/delete/" + record.id).then((response) => {
    const data = response.data;
    if (data.success) {
      notification.success({description: "删除成功！"});
      handleQuery({
        page: pagination.value.current,
        size: pagination.value.pageSize,
      });
    } else {
      notification.error({description: data.message});
    }
  });
};

const handleOk = () => {
  axios.post("/business/admin/daily-train/save", dailyTrain.value).then((response) => {
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

const handleGenDailyOk = () => {
  let date = dayjs(genDaily.value.date).format("YYYY-MM-DD");
  genDailyLoading.value = true;
  axios.get("/business/admin/daily-train/gen-daily/" + date).then((response) => {
    genDailyLoading.value = false;
    let data = response.data;
    if (data.success) {
      notification.success({description: "生成成功！"});
      genDailyVisible.value = false;
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
  axios.get("/business/admin/daily-train/query-list", {
    params: {
      page: param.page,
      size: param.size,
      date: myParams.value.date,
      code: myParams.value.code
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      dailyTrains.value = data.content.list;
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

// 车次下拉组件的返回数据train，赋值给本页面的数据
const onChangeTrainCode = (train) => {
  let t = JSON.parse(JSON.stringify(train));
  // 删除train中的id，防止后端识别出错
  delete t.id;
  // 用assign合并
  dailyTrain.value = Object.assign(dailyTrain.value, t);
}

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
