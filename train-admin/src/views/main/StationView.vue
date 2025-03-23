<template>
  <div class="container">
    <p>
      <a-button type="primary" @click="onAdd">新增</a-button>
    </p>
    <a-table
        :dataSource="stations"
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
      </template>
    </a-table>
    <a-modal v-model:open="open" title="新增车站" @ok="handleOk">
      <a-form
          ref="formRef"
          :model="station"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item
            label="车站名"
            name="name"
            :rules="[{ required: true, message: '车站名不能为空' }]"
        >
          <a-input v-model:value="station.name"/>
        </a-form-item>
        <a-form-item
            label="拼音"
            name="namePinyin"
            :rules="[{ required: true, message: '车站名拼音不能为空' }]"
        >
          <a-input v-model:value="station.namePinyin" disabled/>
        </a-form-item>
        <a-form-item
            label="拼音首字母"
            name="namePy"
            :rules="[{ required: true, message: '拼音首字母不能为空' }]"
        >
          <a-input v-model:value="station.namePy" disabled/>
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
import {onMounted, ref, watch} from 'vue';
import axios from "axios";
import {notification} from "ant-design-vue";
import {pinyin} from "pinyin-pro";

const open = ref(false);
const loading = ref(false);

// 表格
const stations = ref([]);
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 3,
})

let station = ref({
  id: undefined,
  name: undefined,
  namePinyin: undefined,
  namePy: undefined,
  createTime: undefined,
  updateTime: undefined,
});

const columns = [
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
    title: '站名拼音首字母',
    dataIndex: 'namePy',
    key: 'namePy',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  }
];

const onAdd = () => {
  // 清空内容
  station.value = {};
  open.value = true;
};

const onEdit = (record) => {
  // 回显数据，record是本行数据（复制对象，不然修改窗口里的值不保存，也不刷新，那么表格里就会显示成刚才修改的内容）
  station.value = JSON.parse(JSON.stringify(record));
  open.value = true;
}

const handleOk = async e => {
  loading.value = true;
  // 提交数据给后端
  axios.post("/business/admin/station/save", station.value).then((response) => {
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
  axios.delete("/business/admin/station/delete/" + record.id).then((response) => {
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
  axios.get("/business/admin/station/query-list", {
    params: {
      page: params.page,
      size: params.size
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      stations.value = data.content.list;
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

watch(() => station.value.name, () => {
  if (station.value.name != null && station.value.name !== "") {
    station.value.namePinyin = pinyin(station.value.name, {toneType: 'none'}).replaceAll(" ", "");
    station.value.namePy = pinyin(station.value.name, { pattern: 'first', toneType: 'none'}).replaceAll(" ", "");
  } else {
    station.value.namePinyin = "";
  }
}, {immediate: true});


</script>

<style scoped>
.container {
  height: 84vh;
}

</style>
