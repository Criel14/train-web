<template>
  <div class="container">
    <p>
      <a-space>
        <a-date-picker v-model:value="myParams.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        <TrainSelect v-model="myParams.trainCode" width="200px"/>
        <a-button type="primary" @click="handleQuery()">查找</a-button>
        <a-button type="primary" @click="onAdd">新增</a-button>
      </a-space>
    </p>
    <a-table :dataSource="dailyTrainStations"
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
      </template>
    </a-table>
    <a-modal v-model:visible="visible" title="每日火车车站" @ok="handleOk"
             ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="dailyTrainStation"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="日期" :rules="[{ required: true, message: '日期不能为空' }]">
          <a-date-picker v-model:value="dailyTrainStation.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期"/>
        </a-form-item>
        <a-form-item label="车次编号" :rules="[{ required: true, message: '车次编号不能为空' }]">
          <TrainSelect v-model="dailyTrainStation.trainCode"/>
        </a-form-item>
        <a-form-item label="站序" :rules="[{ required: true, message: '站序不能为空' }]">
          <a-input v-model:value="dailyTrainStation.index"/>
        </a-form-item>
        <a-form-item label="站名" :rules="[{ required: true, message: '站名不能为空' }]">
          <StationSelect v-model="dailyTrainStation.name"/>
        </a-form-item>
        <a-form-item label="站名拼音" :rules="[{ required: true, message: '站名拼音不能为空' }]">
          <a-input v-model:value="dailyTrainStation.namePinyin" disabled/>
        </a-form-item>
        <a-form-item label="进站时间" :rules="[{ required: true, message: '进站时间不能为空' }]">
          <a-time-picker v-model:value="dailyTrainStation.inTime" valueFormat="HH:mm:ss" placeholder="请选择时间"/>
        </a-form-item>
        <a-form-item label="出站时间" :rules="[{ required: true, message: '出站时间不能为空' }]">
          <a-time-picker v-model:value="dailyTrainStation.outTime" valueFormat="HH:mm:ss" placeholder="请选择时间"/>
        </a-form-item>
        <a-form-item label="里程（公里）" :rules="[{ required: true, message: '里程（公里）不能为空' }]">
          <a-input v-model:value="dailyTrainStation.km"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {notification} from "ant-design-vue";
import axios from "axios";
import TrainSelect from "@/components/TrainSelect.vue";
import StationSelect from "@/components/StationSelect.vue";
import {pinyin} from "pinyin-pro";

const visible = ref(false);
let dailyTrainStation = ref({
  id: undefined,
  date: undefined,
  trainCode: undefined,
  index: undefined,
  name: undefined,
  namePinyin: undefined,
  inTime: undefined,
  outTime: undefined,
  stopTime: undefined,
  km: undefined,
  createTime: undefined,
  updateTime: undefined,
});
let loading = ref(false);
let myParams = ref({
  trainCode: undefined,
  date: undefined,
})
const dailyTrainStations = ref([]);
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
    title: '站序',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: '站名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '站名拼音',
    dataIndex: 'namePinyin',
    key: 'namePinyin',
  },
  {
    title: '进站时间',
    dataIndex: 'inTime',
    key: 'inTime',
  },
  {
    title: '出站时间',
    dataIndex: 'outTime',
    key: 'outTime',
  },
  {
    title: '停站时长',
    dataIndex: 'stopTime',
    key: 'stopTime',
  },
  {
    title: '里程（公里）',
    dataIndex: 'km',
    key: 'km',
  },
  {
    title: '操作',
    dataIndex: 'operation'
  }
];

const onAdd = () => {
  dailyTrainStation.value = {};
  visible.value = true;
};

const onEdit = (record) => {
  dailyTrainStation.value = JSON.parse(JSON.stringify(record));
  visible.value = true;
};

const onDelete = (record) => {
  axios.delete("/business/admin/daily-train-station/delete/" + record.id).then((response) => {
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
  axios.post("/business/admin/daily-train-station/save", dailyTrainStation.value).then((response) => {
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
  axios.get("/business/admin/daily-train-station/query-list", {
    params: {
      page: param.page,
      size: param.size,
      date: myParams.value.date,
      trainCode: myParams.value.trainCode
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      dailyTrainStations.value = data.content.list;
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

watch(() => dailyTrainStation.value.name, () => {
  if (dailyTrainStation.value.name != null && dailyTrainStation.value.name !== "") {
    dailyTrainStation.value.namePinyin = pinyin(dailyTrainStation.value.name, {toneType: 'none'}).replaceAll(" ", "");
  } else {
    dailyTrainStation.value.namePinyin = "";
  }
}, {immediate: true});


</script>

<style scoped>
.container {
  height: 84vh;
}

</style>
