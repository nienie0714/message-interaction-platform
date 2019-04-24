<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo-header">
        <!-- <img :src="require('@img/logo_header.png')"/> -->
        消息交互平台
      </div>
    </div>
    <div class="login-main">
      <div class="login-bg">
        <div class="login-div">
          <div class="login-div-header">
            <span>用户登录</span>
          </div>
          <div class="login-div-header-main-border">
            <span>————————&nbsp;&nbsp;&nbsp;&nbsp;LOGIN&nbsp;&nbsp;&nbsp;&nbsp;————————</span>
          </div>
          <div class="login-div-main">
            <el-input class="login-username" v-model.trim="loginData.username" :placeholder="'请输入用户名'" :maxlength="20" @blur="getPasswordByUsername" @keyup.enter.native="handleLogin"></el-input>
            <el-input class="login-password" :type="passwordType?'password':null" v-model.trim="loginData.password" :placeholder="'请输入密码'" :maxlength="18" @keyup.enter.native="handleLogin">
              <div slot="suffix" :class="passwordType?'login-icon login-password-close':'login-icon login-password-open'" @click="changePassType()"></div>
            </el-input>
            <div class="login-remember">
              <el-checkbox-group v-model="remember">
                <el-checkbox :label="true">记住密码</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="login-button">
              <el-button @click="handleLogin">登 录</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="login-footer">西安悦泰科技有限责任公司版权所有 Developed by YueTai Tech Co.,Ltd 2018</div>
  </div>
</template>

<script>
import { queryAll } from '../../api/base'
import basicMsgMixin from '../../components/mixin/basicMsgMixin'
export default {
  mixins: [basicMsgMixin],
  data () {
    return {
      loginUrl: '/manage/login',
      loginData: {
        username: '',
        password: ''
      },
      passwordType: true,
      remember: false
    }
  },
  mounted () {
    localStorage.setItem('token', '')
    localStorage.setItem('indexTime', '')
    localStorage.setItem('userName', '')
    window.name = this.$route.name
  },
  methods: {
    getPasswordByUsername () {
      var password = localStorage.getItem(this.loginData.username)
      if (password) {
        this.loginData.password = password
      }
    },
    handleLogin () {
      if ((this.loginData.username && this.loginData.username != '') && (this.loginData.password && this.loginData.password != '')) {
        if (this.remember) {
          localStorage.setItem(this.loginData.username, this.loginData.password)
        }
        queryAll(this.loginUrl, this.loginData).then(res => {
          if (res.data.code == 0) {
            localStorage.setItem('token', res.data.data.token ? res.data.data.token : '')
            localStorage.setItem('userName', this.loginData.username)
            this.$router.push('/basicdata/')
          } else if (res.data.code == -1) {
            this.showError('登录', '用户名或密码错误 !')
          } else {
            this.showError('登录', '请求失败，请检查网络 !')
          }
        })
      } else if (this.loginData.username == '') {
        this.showError('登录', '请输入用户名 !')
      } else if (this.loginData.password == '') {
        this.showError('登录', '请输入密码 !')
      }
    },
    changePassType () {
      this.passwordType = !this.passwordType
    }
  }
}
</script>

<style>
.login-page {
  height: 100%;
  text-align: center;
  background: #09141f;
}
.login-header {
  text-align: left;
  padding: 40px 0 0 50px;
  color: #fff;
  font-size: 36px;
}
.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 94px);
}
.login-bg {
  width: 830px;
  height: 600px;
  display: flex;
  justify-content: center;
  background: url('../../assets/img/login_bg.jpg');
}
.login-div {
  width: 400px;
  height: 400px;
  border-radius: 16px;
  background: url('../../assets/img/login_box_bg.png');
  border: 1px solid rgba(60, 166, 200, 0.7);
  box-shadow: 0 0 50px rgba(60, 166, 200, 0.4) inset, 0 20px 80px rgba(9, 20, 30, 0.9);
}
.login-footer {
  position: absolute;
  font-size: 14px;
  color: #225f75;
  left: calc(50% - 238.5px);
  bottom: 30px;
}
.login-div-header span {
  display: block;
  width: 100px;
  height: 24px;
  line-height: 24px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  margin: 20px 150px;
}
.login-div-header-main-border span{
  color: #25657d;
  margin: 0 30px;
}
.login-div-main {
  margin: 0 30px;
}
.login-div-main .el-input__inner {
  height: 42px;
  border-radius: 21px;
}
.login-username {
  margin: 50px 0 30px 0;
}
.login-password {
  margin: 0 0 30px 0;
}
.login-icon {
  width: 20px;
  height: 20px;
  margin: 11px 10px;
}
.login-password-close {
  background: url('../../assets/img/eye_invisible.png');
}
.login-password-open {
  background: url('../../assets/img/eye_visible.png');
}
.login-remember {
  height: 16px;
  width: 100%;
}
.login-remember .el-checkbox-group {
  float: left;
}
.login-remember .el-checkbox-group .el-checkbox__label{
  color: #fff;
  font-size: 16px;
}
.login-button {
  margin: 30px 0;
  height: 50px;
}
</style>
