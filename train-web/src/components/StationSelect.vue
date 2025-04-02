<template>
  <a-select
      v-model:value="name"
      show-search
      allowClear
      :filterOption="filterNameOption"
      @change="onChange"
      :placeholder="placeholder"
      :style="'width: ' + localWidth"
  >
    <a-select-option
        v-for="item in stations"
        :key="item.name"
        :value="item.name"
        :label="item.name + item.namePinyin + item.namePy"
    >
      {{ item.name }} - {{ item.namePinyin }} - {{ item.namePy }}
    </a-select-option>
  </a-select>
</template>

<script setup>
import {defineProps, onMounted, ref, watch} from 'vue';
import axios from 'axios';
import {notification} from 'ant-design-vue';

const props = defineProps({
  modelValue: {},
  width: {},
  placeholder: {
    type: String,
    default: '请选择车站'
  }
});
// eslint-disable-next-line no-undef
const emit = defineEmits(['update:modelValue', 'change']);

const name = ref();
const stations = ref([]);
const localWidth = ref(props.width || '100%');

watch(() => props.modelValue, () => {
  name.value = props.modelValue;
}, {immediate: true});

/**
 * 查询所有的车站，用于车站下拉框
 */
const queryAllStation = () => {
  let stationList = window.sessionStorage.getItem(window.SESSION_ALL_STATION);
  if (stationList != null) {
    stations.value = JSON.parse(stationList);
  } else {
    axios.get("/business/station/query-all").then((response) => {
      const data = response.data;
      if (data.success) {
        stations.value = data.content;
        // 保存缓存
        window.sessionStorage.setItem(window.SESSION_ALL_STATION, JSON.stringify(data.content));
      } else {
        notification.error({description: data.message});
      }
    });
  }
};

/**
 * 车站下拉框筛选
 */
const filterNameOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

/**
 * 将当前组件的值响应给父组件
 * @param value
 */
const onChange = (value) => {
  emit('update:modelValue', value);
  let station = stations.value.find(item => item.code === value) || {};
  emit('change', station);
};

onMounted(() => {
  queryAllStation();
});
</script>
