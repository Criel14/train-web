<template>
  <div class="container">
    <div class="order-train">
      <span class="order-train-main" style="margin-left: 0;">{{ dailyTrainTicket.date }}</span>
      <span class="order-train-main">{{ dailyTrainTicket.trainCode }}</span>次
      <span class="order-train-main">{{ dailyTrainTicket.start }}</span>站
      <span class="order-train-main">({{ dailyTrainTicket.startTime }})</span>
      <span class="order-train-main">——</span>
      <span class="order-train-main">{{ dailyTrainTicket.end }}</span>站
      <span class="order-train-main">({{ dailyTrainTicket.endTime }})</span>

      <div class="order-train-ticket">
          <span v-for="item in seatTypes" :key="item.type">
            <span>{{ item.desc }}</span>
            <span class="order-train-ticket-main">({{ item.price }}元)</span>
            <span class="order-train-ticket-main">{{ item.count }}</span>
            <span style="margin-right: 30px">张票</span>
          </span>
      </div>
      <!--  TODO 展示车次的相关信息：车厢数、途径车站等    -->
    </div>
    <a-divider/>
    <b>选择乘车人</b>&nbsp;
    <a-checkbox-group v-model:value="passengerChecks" :options="passengerOptions"/>

    <div class="order-tickets">
      <a-row class="order-tickets-header">
        <a-col :span="2">乘车人</a-col>
        <a-col :span="6">身份证</a-col>
        <a-col :span="4">乘车人类型</a-col>
        <a-col :span="4">座位类型</a-col>
      </a-row>
      <a-row class="order-tickets-row" v-for="ticket in tickets" :key="ticket.passengerId">
        <a-col :span="2">{{ ticket.passengerName }}</a-col>
        <a-col :span="6">{{ ticket.passengerIdCard }}</a-col>
        <a-col :span="4">
          <a-select v-model:value="ticket.passengerType" style="width: 100%">
            <a-select-option v-for="item in PASSENGER_TYPE_ARRAY" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="ticket.seatTypeCode" style="width: 100%">
            <a-select-option v-for="item in seatTypes" :key="item.code" :value="item.code">
              {{ item.desc }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>
    </div>

    <div v-if="tickets.length > 0" class="submit-container">
      <a-button type="primary" size="large" @click="finishCheckPassenger">提交订单</a-button>
    </div>
    <div v-else class="submit-container">
      <a-button type="primary" size="large" @click="finishCheckPassenger" disabled>提交订单</a-button>
    </div>

    <a-modal v-model:visible="visible" title="请核对以下购票信息"
             style="top: 50px; width: 800px"
             @ok="handleOk">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">提交</a-button>
      </template>
      <div class="order-tickets">
        <a-row class="order-tickets-header" v-if="tickets.length > 0">
          <a-col :span="3">乘车人</a-col>
          <a-col :span="15">身份证</a-col>
          <a-col :span="3">乘车人类型</a-col>
          <a-col :span="3">座位类型</a-col>
        </a-row>
        <a-row class="order-tickets-row" v-for="ticket in tickets" :key="ticket.passengerId">
          <a-col :span="3">{{ ticket.passengerName }}</a-col>
          <a-col :span="15">{{ ticket.passengerIdCard }}</a-col>
          <a-col :span="3">
            <span v-for="item in PASSENGER_TYPE_ARRAY" :key="item.code">
              <span v-if="item.code === ticket.passengerType">
                {{ item.desc }}
              </span>
            </span>
          </a-col>
          <a-col :span="3">
            <span v-for="item in seatTypes" :key="item.code">
              <span v-if="item.code === ticket.seatTypeCode">
                {{ item.desc }}
              </span>
            </span>
          </a-col>
        </a-row>
        <br/>
        <div v-if="chooseSeatType === 0" style="color: red;">
          您购买的车票不支持选座：
          <div>只有全部是一等座或全部是二等座才支持选座</div>
          <div>或当前余票数量有限</div>
        </div>
        <div v-else style="text-align: center">
          <a-switch class="choose-seat-item" v-for="item in SEAT_COL_ARRAY" :key="item.code"
                    v-model:checked="chooseSeatObj[item.code + '1']" :checked-children="item.desc"
                    :un-checked-children="item.desc"/>
          <div v-if="tickets.length > 1">
            <a-switch class="choose-seat-item" v-for="item in SEAT_COL_ARRAY" :key="item.code"
                      v-model:checked="chooseSeatObj[item.code + '2']" :checked-children="item.desc"
                      :un-checked-children="item.desc"/>
          </div>
          <div style="color: #999999">您可以选择{{ tickets.length }}个座位</div>
        </div>
        <br/>
        <!--        最终购票：{{ tickets }}-->
        <!--        最终选座：{{ chooseSeatObj }}-->
      </div>
    </a-modal>

    <a-modal v-model:visible="lineUpVisible"
             title="订单信息"
             style="top: 50px; width: 800px"
    >
      <div v-if="lineUpCount > 0">
        系统正在处理中... 您前面还有{{ lineUpCount }}位用户正在排队，请稍后
      </div>
      <div v-else>
        系统正在处理中...
      </div>

    </a-modal>
  </div>
</template>

<script setup>

import {ref, onMounted, watch, computed} from 'vue';
import axios from "axios";
import {notification} from "ant-design-vue";

const passengers = ref([]);
const passengerOptions = ref([]);
const passengerChecks = ref([]);
const dailyTrainTicket = JSON.parse(window.sessionStorage.getItem(window.SESSION_ORDER)) || {};
console.log("下单的车次信息", dailyTrainTicket);

const SEAT_TYPE = window.SEAT_TYPE;
const loading = ref(false);

const seatTypes = [];
for (let KEY in SEAT_TYPE) {
  let key = KEY.toLowerCase();
  // 去除没有的座位类型
  if (dailyTrainTicket[key] >= 0) {
    seatTypes.push({
      type: KEY,
      code: SEAT_TYPE[KEY]["code"],
      desc: SEAT_TYPE[KEY]["desc"],
      count: dailyTrainTicket[key],
      price: dailyTrainTicket[key + 'Price'],
    })
  }
}
console.log("本车次提供的座位：", seatTypes)

const tickets = ref([]);
const PASSENGER_TYPE_ARRAY = window.PASSENGER_TYPE_ARRAY;
const visible = ref(false);
const lineUpVisible = ref(false);
const confirmOrderId = ref();
const lineUpCount = ref(-4); // 默认是【取消】状态

// 勾选或去掉某个乘客时，在购票列表中加上或去掉一张表
watch(() => passengerChecks.value, (newVal, oldVal) => {
  // console.log("勾选乘客发生变化", newVal, oldVal)
  // 每次有变化时，把购票列表清空，重新构造列表
  tickets.value = [];
  passengerChecks.value.forEach((item) => tickets.value.push({
    passengerId: item.id,
    passengerType: item.type,
    seatTypeCode: seatTypes[0].code,
    passengerName: item.name,
    passengerIdCard: item.idCard
  }))
}, {immediate: true});

// 0：不支持选座；1：选一等座；2：选二等座
const chooseSeatType = ref(0);

// 根据选择的座位类型，计算出对应的列，比如要选的是一等座，就筛选出ACDF，要选的是二等座，就筛选出ABCDF
const SEAT_COL_ARRAY = computed(() => {
  return window.SEAT_COL_ARRAY.filter(item => item.type === chooseSeatType.value);
});

// 选择的座位
// {
//   A1: false, C1: true，D1: false, F1: false，
//   A2: false, C2: false，D2: true, F2: false
// }
const chooseSeatObj = ref({});
watch(() => SEAT_COL_ARRAY.value, () => {
  chooseSeatObj.value = {};
  for (let i = 1; i <= 2; i++) {
    SEAT_COL_ARRAY.value.forEach((item) => {
      chooseSeatObj.value[item.code + i] = false;
    })
  }
  console.log("初始化两排座位，都是未选中：", chooseSeatObj.value);
}, {immediate: true});

const handleQueryPassenger = () => {
  axios.get("/member/passenger/query-mine").then((response) => {
    let data = response.data;
    if (data.success) {
      passengers.value = data.content;
      passengers.value.forEach((item) => passengerOptions.value.push({
        label: item.name,
        value: item
      }))
    } else {
      notification.error({description: data.message});
    }
  });
};

const handleCancel = () => {
  visible.value = false;
}

const finishCheckPassenger = () => {
  console.log("购票列表：", tickets.value);

  if (tickets.value.length > 5) {
    notification.error({description: '最多只能购买5张车票'});
    return;
  }

  // 校验余票是否充足，购票列表中的每个座位类型，都去车次座位余票信息中，看余票是否充足
  // 前端校验不一定准，但前端校验可以减轻后端很多压力
  // 注意：这段只是校验，必须copy出seatTypesTemp变量来扣减，用原始的seatTypes去扣减，会影响真实的库存
  let seatTypesTemp = JSON.parse(JSON.stringify(seatTypes));
  for (let i = 0; i < tickets.value.length; i++) {
    let ticket = tickets.value[i];
    for (let j = 0; j < seatTypesTemp.length; j++) {
      let seatType = seatTypesTemp[j];
      // 同类型座位余票-1，这里扣减的是临时copy出来的库存，不是真正的库存，只是为了校验
      if (ticket.seatTypeCode === seatType.code) {
        seatType.count--;
        if (seatType.count < 0) {
          notification.error({description: seatType.desc + '余票不足'});
          return;
        }
      }
    }
  }
  console.log("前端余票校验通过");

  // 判断是否支持选座，只有纯一等座和纯二等座支持选座
  // 先筛选出购票列表中的所有座位类型，比如四张表：[1, 1, 2, 2]
  let ticketSeatTypeCodes = [];
  for (let i = 0; i < tickets.value.length; i++) {
    let ticket = tickets.value[i];
    ticketSeatTypeCodes.push(ticket.seatTypeCode);
  }
  // 为购票列表中的所有座位类型去重：[1, 2]
  const ticketSeatTypeCodesSet = Array.from(new Set(ticketSeatTypeCodes));
  console.log("选好的座位类型：", ticketSeatTypeCodesSet);
  if (ticketSeatTypeCodesSet.length !== 1) {
    console.log("选了多种座位，不支持选座");
    chooseSeatType.value = 0;
  } else {
    // ticketSeatTypeCodesSet.length === 1，即只选择了一种座位（不是一个座位，是一种座位）
    if (ticketSeatTypeCodesSet[0] === SEAT_TYPE.YDZ.code) {
      console.log("一等座选座");
      chooseSeatType.value = SEAT_TYPE.YDZ.code;
    } else if (ticketSeatTypeCodesSet[0] === SEAT_TYPE.EDZ.code) {
      console.log("二等座选座");
      chooseSeatType.value = SEAT_TYPE.EDZ.code;
    } else {
      console.log("不是一等座或二等座，不支持选座");
      chooseSeatType.value = 0;
    }

    // 余票小于20张时，不允许选座，否则选座成功率不高，影响出票
    if (chooseSeatType.value !== 0) {
      for (let i = 0; i < seatTypes.length; i++) {
        let seatType = seatTypes[i];
        // 找到同类型座位
        if (ticketSeatTypeCodesSet[0] === seatType.code) {
          // 判断余票，小于20张就不支持选座
          if (seatType.count < 20) {
            console.log("余票小于20张就不支持选座")
            chooseSeatType.value = 0;
            break;
          }
        }
      }
    }
  }

  // 弹出确认界面
  visible.value = true;
};

const handleOk = () => {
  console.log("选好的座位：", chooseSeatObj.value);

  // 设置每张票的座位
  // 先清空购票列表的座位，有可能之前选了并设置座位了，但选座数不对被拦截了，又重新选一遍
  for (let i = 0; i < tickets.value.length; i++) {
    tickets.value[i].seat = null;
  }
  let i = -1;
  // 要么不选座位，要么所选座位应该等于购票数，即i === (tickets.value.length - 1)
  for (let key in chooseSeatObj.value) {
    if (chooseSeatObj.value[key]) {
      i++;
      if (i > tickets.value.length - 1) {
        notification.error({description: '所选座位数大于购票数'});
        return;
      }
      tickets.value[i].seat = key;
    }
  }
  if (i > -1 && i < (tickets.value.length - 1)) {
    notification.error({description: '所选座位数小于购票数'});
    return;
  }

  console.log("最终购票：", tickets.value);
  loading.value = true;
  axios.post("/business/confirm-order/confirm", {
    dailyTrainTicketId: dailyTrainTicket.id,
    date: dailyTrainTicket.date,
    trainCode: dailyTrainTicket.trainCode,
    start: dailyTrainTicket.start,
    end: dailyTrainTicket.end,
    tickets: tickets.value
  }).then((response) => {
    loading.value = false;
    let data = response.data;
    visible.value = true;
    if (data.success) {
      visible.value = false;
      lineUpVisible.value = true;
      confirmOrderId.value = data.content;
      // 查询订单状态
      queryOrderStatus();
    } else {
      notification.error({description: data.message});
    }
  });
}

let queryOrderInterval = null;
const queryOrderStatus = () => {
  lineUpCount.value = -1;
  queryOrderInterval = setInterval(function () {
    axios.get("/business/confirm-order/query-line-up-count/" + confirmOrderId.value).then((response) => {
      let data = response.data;
      if (data.success) {
        let result = data.content;
        switch (result) {
          case -1 :
            notification.success({description: "购票成功"});
            lineUpVisible.value = false;
            clearInterval(queryOrderInterval);
            break;
          case -2:
            notification.error({description: "购票失败"});
            lineUpVisible.value = false;
            clearInterval(queryOrderInterval);
            break;
          case -3:
            notification.error({description: "当前车票已买完"});
            lineUpVisible.value = false;
            clearInterval(queryOrderInterval);
            break;
          default:
            lineUpCount.value = result;
        }
      } else {
        notification.error({description: data.message});
      }
    });
  }, 500);
}

onMounted(() => {
  handleQueryPassenger();
});
</script>

<style scoped>
.container {
  height: 84vh;
}

.order-train .order-train-main {
  font-size: 18px;
  font-weight: bold;
  margin-left: 20px;
}

.order-train .order-train-ticket {
  margin-top: 15px;
}

.order-train .order-train-ticket .order-train-ticket-main {
  color: red;
  font-weight: bold;
  margin-left: 10px;
}

.order-tickets {
  margin: 10px 0;
}

.order-tickets .ant-col {
  padding: 5px 10px;
}

.order-tickets .order-tickets-header {
  background-color: cornflowerblue;
  border: solid 1px cornflowerblue;
  color: white;
  font-size: 16px;
  padding: 5px 0;
}

.order-tickets .order-tickets-row {
  border: solid 1px cornflowerblue;
  border-top: none;
  vertical-align: middle;
  line-height: 30px;
}

.order-tickets .choose-seat-item {
  margin: 5px 5px;
}

.submit-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
