<template>
  <a-select v-model:value="trainCode" show-search allowClear
            :filterOption="filterTrainCodeOption"
            @change="onChange" placeholder="请选择车次"
            :style="'width: ' + localWidth">
    <a-select-option v-for="item in trains" :key="item.code" :value="item.code"
                     :label="item.code + item.start + item.end">
      {{ item.code }} {{ item.start }} ~ {{ item.end }}
    </a-select-option>
  </a-select>
</template>

<script setup>

import {onMounted, ref, watch} from 'vue';
import axios from "axios";
import {notification} from "ant-design-vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  modelValue: {},
  width: {}
})

// eslint-disable-next-line no-undef
const emit = defineEmits(['update:modelValue', 'change'])

const trainCode = ref();
const trains = ref([]);
const localWidth = ref(props.width);
if (props.width == null || props.width === '') {
  localWidth.value = "100%";
}

// 利用watch，动态获取父组件的值，如果放在onMounted或其它方法里，则只有第一次有效
watch(() => props.modelValue, () => {
  console.log("props.modelValue", props.modelValue);
  trainCode.value = props.modelValue;
}, {immediate: true});

/**
 * 查询所有的车次，用于车次下拉框
 */
const queryAllTrain = () => {
  // 先读取缓存
  let trainList = window.sessionStorage.getItem(window.SESSION_ALL_TRAIN);
  if (trainList != null) {
    trains.value = JSON.parse(trainList);
  } else {
    axios.get("/business/train/query-all").then((response) => {
      let data = response.data;
      if (data.success) {
        trains.value = data.content;
        // 保存缓存
        window.sessionStorage.setItem(window.SESSION_ALL_TRAIN, JSON.stringify(data.content));
      } else {
        notification.error({description: data.message});
      }
    });
  }
};

/**
 * 车次下拉框筛选
 */
const filterTrainCodeOption = (input, option) => {
  console.log(input, option);
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

/**
 * 将当前组件的值响应给父组件
 * @param value
 */
const onChange = (value) => {
  emit('update:modelValue', value);
  let train = trains.value.filter(item => item.code === value)[0];
  if (train == null) {
    train = {};
  }
  emit('change', train);
};

onMounted(() => {
  queryAllTrain();
});


</script>
