<template>
  <div class="container">
    <p>
      <a-button type="primary" @click="onAdd">新增</a-button>
    </p>
    <a-table
        :dataSource="passengers"
        :columns="columns"
        :pagination="pagination"
        @change="handleTableChange"
        :loading="loading"
    >
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
          <span v-for="item in PASSENGER_TYPE_ARRAY" :key="item.code">
            <span v-if="item.code === record.type">
              {{ item.desc }}
            </span>
          </span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="open" title="新增乘车人" @ok="handleOk">
      <a-form
          ref="formRef"
          :model="passenger"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item
            label="乘车人姓名"
            name="name"
            :rules="[{ required: true, message: '乘车人姓名不能为空' }]"
        >
          <a-input v-model:value="passenger.name"/>
        </a-form-item>
        <a-form-item
            label="身份证号"
            name="idCard"
            :rules="[{ required: true, message: '身份证号不能为空' }]"
        >
          <a-input v-model:value="passenger.idCard"/>
        </a-form-item>
        <a-form-item
            label="乘车人类型"
            name="type"
            :rules="[{ required: true, message: '类型不能为空' }]"
        >
          <a-select v-model:value="passenger.type">
            <a-select-option v-for="item in PASSENGER_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">提交</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import axios from "axios";
import {notification} from "ant-design-vue";

const PASSENGER_TYPE_ARRAY = window.PASSENGER_TYPE_ARRAY;
const open = ref(false);
const loading = ref(false);
let passenger = ref({
  id: undefined,
  memberId: undefined,
  name: undefined,
  idCard: undefined,
  type: undefined,
  createTime: undefined,
  updateTime: undefined,
})

// 表格
const passengers = ref([]);
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '身份证',
    dataIndex: 'idCard',
    key: 'idCard',
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  }
];
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: false,
})

const onAdd = () => {
  // 清空内容
  passenger.value = {};
  open.value = true;
};

const onEdit = (record) => {
  // 回显数据，record是本行数据（复制对象，不然修改窗口里的值不保存，也不刷新，那么表格里就会显示成刚才修改的内容）
  passenger.value = JSON.parse(JSON.stringify(record));
  open.value = true;
}

const handleOk = async e => {
  loading.value = true;
  // 提交数据给后端
  axios.post("/member/passenger/save", passenger.value).then((response) => {
    let data = response.data;
    loading.value = false;
    if (data.success) {
      notification.success({description: "保存成功"});
      open.value = false;
      // 刷新列表
      handleQuery({
        page: 1,
        size: pagination.value.pageSize
      })
    } else {
      // 错误时不关闭model
      notification.error({description: data.message});
    }
  })
};

const onDelete = (record) => {
  axios.delete("/member/passenger/delete/" + record.id).then((response) => {
    let data = response.data;
    if (data.success) {
      notification.success({description: "删除成功"});
      // 刷新列表
      handleQuery({
        page: 1,
        size: pagination.value.pageSize
      });
    } else {
      notification.error({description: data.message});
    }
  })
}

const handleCancel = () => {
  open.value = false;
};

const handleQuery = (params) => {
  if (!params) {
    params = {
      page: 1,
      size: pagination.value.pageSize
    }
  }
  loading.value = true;
  axios.get("/member/passenger/query-list", {
    params: {
      page: params.page,
      size: params.size
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      passengers.value = data.content.list;
      pagination.value.current = params.page;
      pagination.value.total = data.content.total;
    } else {
      notification.error({description: data.message});
    }
  })
}

const handleTableChange = (pagination) => {
  handleQuery({
    page: pagination.current,
    size: pagination.pageSize
  })
}

onMounted(() => {
  handleQuery({
    page: 1,
    size: pagination.value.pageSize
  })
})
</script>

<style scoped>
.container {
  height: 84vh;
}

</style>
