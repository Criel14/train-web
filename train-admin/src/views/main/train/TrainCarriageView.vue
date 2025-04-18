<template>
  <div class="container">
    <p>
      <a-space>
        <TrainSelect v-model="params.trainCode" width="200px"/>
        <a-button type="primary" @click="handleQuery()">查找</a-button>
        <a-button type="primary" @click="onAdd">新增</a-button>
      </a-space>
    </p>
    <a-table :dataSource="trainCarriages"
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
        <template v-else-if="column.dataIndex === 'seatType'">
          <span v-for="item in SEAT_TYPE_ARRAY" :key="item.code">
            <span v-if="item.code === record.seatType">
              {{ item.desc }}
            </span>
          </span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="visible" title="火车车厢" @ok="handleOk"
             ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="trainCarriage"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="车次编号" :rules="[{ required: true, message: '车次编号不能为空' }]">
          <TrainSelect v-model="trainCarriage.trainCode"/>
        </a-form-item>
        <a-form-item label="厢号" :rules="[{ required: true, message: '厢号不能为空' }]">
          <a-input v-model:value="trainCarriage.index"/>
        </a-form-item>
        <a-form-item label="座位类型" :rules="[{ required: true, message: '座位类型不能为空' }]">
          <a-select v-model:value="trainCarriage.seatType">
            <a-select-option v-for="item in SEAT_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排数" :rules="[{ required: true, message: '排数不能为空' }]">
          <a-input v-model:value="trainCarriage.rowCount"/>
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

const SEAT_TYPE_ARRAY = window.SEAT_TYPE_ARRAY;
const visible = ref(false);
let trainCarriage = ref({
  id: undefined,
  trainCode: undefined,
  index: undefined,
  seatType: undefined,
  seatCount: undefined,
  rowCount: undefined,
  colCount: undefined,
  createTime: undefined,
  updateTime: undefined,
});
const trainCarriages = ref([]);
// 分页的三个属性名是固定的
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: false,
});
let loading = ref(false);
let params = ref({
  trainCode: null
})
const columns = [
  {
    title: '车次编号',
    dataIndex: 'trainCode',
    key: 'trainCode',
  },
  {
    title: '厢号',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: '座位类型',
    dataIndex: 'seatType',
    key: 'seatType',
  },
  {
    title: '座位数',
    dataIndex: 'seatCount',
    key: 'seatCount',
  },
  {
    title: '排数',
    dataIndex: 'rowCount',
    key: 'rowCount',
  },
  {
    title: '列数',
    dataIndex: 'colCount',
    key: 'colCount',
  },
  {
    title: '操作',
    dataIndex: 'operation'
  }
];

const onAdd = () => {
  trainCarriage.value = {};
  visible.value = true;
};

const onEdit = (record) => {
  trainCarriage.value = JSON.parse(JSON.stringify(record));
  visible.value = true;
};

const onDelete = (record) => {
  axios.delete("/business/admin/train-carriage/delete/" + record.id).then((response) => {
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
  axios.post("/business/admin/train-carriage/save", trainCarriage.value).then((response) => {
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
  axios.get("/business/admin/train-carriage/query-list", {
    params: {
      page: param.page,
      size: param.size,
      trainCode: params.value.trainCode
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      trainCarriages.value = data.content.list;
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
