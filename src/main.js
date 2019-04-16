// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import echarts from 'echarts'
import 'element-ui/lib/theme-chalk/index.css'
import './style/custom.css'
import router from './router'
import { axiosReq, axiosNoneReq, axiosOtherReq, axiosDfs, upload } from './conf/axios.conf'
import store from './store'

Vue.config.productionTip = false
Vue.prototype.axios = axiosReq
Vue.prototype.axiosNone = axiosNoneReq
Vue.prototype.axiosOther = axiosOtherReq
Vue.prototype.dfs = axiosDfs
Vue.prototype.axiosUpload = upload
Vue.prototype.$echarts = echarts
Vue.prototype.$transfer = new Vue()

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
