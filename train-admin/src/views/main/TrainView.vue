<template>
  <div class="container">
    <p>
      <a-button type="primary" @click="onAdd">新增</a-button>
    </p>
    <a-table
        :dataSource="trains"
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
          <span v-for="item in TRAIN_TYPE_ARRAY" :key="item.code">
            <span v-if="item.code === record.type">
              {{ item.desc }}
            </span>
          </span>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="open" title="新增车次" @ok="handleOk">
      <a-form
          ref="formRef"
          :model="train"
          name="basic"
          autocomplete="off"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          style="margin-top: 24px"
      >
        <a-form-item
            label="车次编号"
            name="code"
            :rules="[{ required: true, message: '车次编号不能为空' }]"
        >
          <a-input v-model:value="train.code"/>
        </a-form-item>
        <a-form-item
            label="车次类型"
            name="type"
            :rules="[{ required: true, message: '类型不能为空' }]"
        >
          <a-select v-model:value="train.type">
            <a-select-option v-for="item in TRAIN_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
            label="始发站"
            name="start"
            :rules="[{ required: true, message: '始发站不能为空' }]"
        >
          <StationSelect v-model="train.start" />
        </a-form-item>
        <a-form-item
            label="始发站拼音"
            name="startPinyin"
            :rules="[{ required: true, message: '始发站拼音不能为空' }]"
        >
          <a-input v-model:value="train.startPinyin" disabled/>
        </a-form-item>
        <a-form-item
            label="出发时间"
            name="startTime"
            :rules="[{ required: true, message: '出发时间不能为空' }]"
        >
          <a-time-picker v-model:value="train.startTime" valueFormat="HH:mm:ss" placeholder="请选择时间" />
        </a-form-item>
        <a-form-item
            label="终点站"
            name="end"
            :rules="[{ required: true, message: '终点站不能为空' }]"
        >
          <StationSelect v-model="train.end" />
        </a-form-item>
        <a-form-item
            label="终点站拼音"
            name="endPinyin"
            :rules="[{ required: true, message: '终点站拼音不能为空' }]"
        >
          <a-input v-model:value="train.endPinyin" disabled/>
        </a-form-item>
        <a-form-item
            label="到站时间"
            name="endTime"
            :rules="[{ required: true, message: '到站时间不能为空' }]"
        >
          <a-time-picker v-model:value="train.endTime" valueFormat="HH:mm:ss" placeholder="请选择时间" />
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
import StationSelect from "@/components/StationSelect.vue";

const TRAIN_TYPE_ARRAY = window.TRAIN_TYPE_ARRAY;
const open = ref(false);
const loading = ref(false);
let train = ref({
  id: undefined,
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

// 表格
const trains = ref([]);
const columns = [
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
  train.value = {};
  open.value = true;
};

const onEdit = (record) => {
  // 回显数据，record是本行数据（复制对象，不然修改窗口里的值不保存，也不刷新，那么表格里就会显示成刚才修改的内容）
  train.value = JSON.parse(JSON.stringify(record));
  open.value = true;
}

const handleOk = async e => {
  loading.value = true;
  // 提交数据给后端
  axios.post("/business/admin/train/save", train.value).then((response) => {
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
  axios.delete("/business/admin/train/delete/" + record.id).then((response) => {
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
  axios.get("/business/admin/train/query-list", {
    params: {
      page: params.page,
      size: params.size
    }
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    if (data.success) {
      trains.value = data.content.list;
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

watch(() => train.value.start, ()=>{
  if (train.value.start != null && train.value.start !== "") {
    train.value.startPinyin = pinyin(train.value.start, { toneType: 'none'}).replaceAll(" ", "");
  } else {
    train.value.startPinyin = "";
  }
}, {immediate: true});

watch(() => train.value.end, ()=>{
  if (train.value.end != null && train.value.end !== "") {
    train.value.endPinyin = pinyin(train.value.end, { toneType: 'none'}).replaceAll(" ", "");
  } else {
    train.value.endPinyin = "";
  }
}, {immediate: true});

</script>

<style scoped>
.container {
  height: 84vh;
}

</style>
