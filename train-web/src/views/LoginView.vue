<template>
  <a-row>
    <a-col :span="8"></a-col>
    <a-col :span="8" class="login">
      <div class="login-container">
        <a-row class="title">
          <h1>智程票务</h1>
        </a-row>
        <a-row>
          <a-form
              :model="loginForm"
              name="basic"
              labelAlign="left"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
              autocomplete="off"
          >
            <a-form-item
                class="form-item"
                label="手机号"
                name="mobile"
                :rules="[{ required: true, message: '请输入您的手机号' }]"
            >
              <a-input v-model:value="loginForm.mobile" placeholder="输入手机号"/>
            </a-form-item>

            <a-form-item
                class="form-item"
                label="验证码"
                name="code"
                :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <a-input v-model:value="loginForm.code" placeholder="输入验证码">
                <template #addonAfter>
                  <a @click="getCode">获取验证码</a>
                </template>
              </a-input>

            </a-form-item>

            <a-form-item class="login-button-container">
              <a-button class="login-button" type="primary" @click="login">登录</a-button>
            </a-form-item>

          </a-form>
        </a-row>
      </div>
      <a-row></a-row>
    </a-col>
    <a-col :span="8"></a-col>
  </a-row>
</template>

<script setup>
import {reactive} from 'vue';
import axios from "axios";
import {notification} from "ant-design-vue";
import {useRouter} from 'vue-router'
import store from "@/store";

const loginForm = reactive({
  mobile: '',
  code: '',
});

const router = useRouter();

const getCode = () => {
  axios.post("/member/member/code", {
    mobile: loginForm.mobile
  }).then(response => {
    let data = response.data;
    if (data.success) {
      notification.success({description: "获取验证码成功"});
    } else {
      notification.error({description: data.message});
    }
  });
};

const login = () => {
  axios.post("/member/member/login", loginForm).then((response) => {
    let data = response.data;
    if (data.success) {
      notification.success({description: "登录成功"});
      // 存储到store
      store.commit("setMember", data.content);
      // 登录成功，跳转到控台主页（欢迎页）
      router.push("/welcome");
    } else {
      notification.error({description: data.message});
    }
  })
};

</script>

<style scoped>
.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 40px 0 20px 0;
}

.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-container {
  width: 80%;
  height: 100%;
  background-color: #fff;
  border-radius: 10px;

  margin-top: 30%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  box-shadow: rgba(0, 0, 0, 0.02) 0 5px 5px 5px;
}

.form-item {
  margin: 20px 10px 10px 20px;
  width: 100%;
}

.login-button-container {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-button {
  width: 120px;
  height: 40px;
}
</style>