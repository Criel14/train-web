<template>
  <div class="container">
    <p>
      <a-space>
        <a-button type="primary" @click="onAdd">新增</a-button>
      </a-space>
    </p>
    <a-table :dataSource="skTokens"
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
    <a-modal v-model:visible="visible" title="秒杀令牌" @ok="handleOk"
             ok-text="确认" cancel-text="取消">
      <a-form
          ref="formRef"
          :model="skToken"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item label="日期" :rules="[{ required: true, message: '日期不能为空' }]">
          <a-date-picker v-model:value="skToken.date" valueFormat="YYYY-MM-DD" placeholder="请选择日期" />
        </a-form-item>
        <a-form-item label="车次编号" :rules="[{ required: true, message: '车次编号不能为空' }]">
          <a-input v-model:value="skToken.trainCode" />
        </a-form-item>
        <a-form-item label="令牌余量" :rules="[{ required: true, message: '令牌余量不能为空' }]">
          <a-input v-model:value="skToken.count" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {notification} from "ant-design-vue";
import axios from "axios";

const visible = ref(false);
let skToken = ref({
  id: undefined,
  date: undefined,
  trainCode: undefined,
  count: undefined,
  createTime: undefined,
  updateTime: undefined,
});
const skTokens = ref([]);
// 分页的三个属性名是固定的
const pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
});
let loading = ref(false);
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
    title: '令牌余量',
    dataIndex: 'count',
    key: 'count',
  },
  {
    title: '操作',
    dataIndex: 'operation'
  }
];

const onAdd = () => {
  skToken.value = {};
  visible.value = true;
};

const onEdit = (record) => {
  skToken.value = JSON.parse(JSON.stringify(record));
  visible.value = true;
};

const onDelete = (record) => {
  axios.delete("/business/admin/sk-token/delete/" + record.id).then((response) => {
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
  axios.post("/business/admin/sk-token/save", skToken.value).then((response) => {
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
  axios.get("/business/admin/sk-token/query-list", {
    params: {
      page: param.page,
      size: param.size
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      skTokens.value = data.content.list;
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
