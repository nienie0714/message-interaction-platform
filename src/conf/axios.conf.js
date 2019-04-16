// import router from '../router'
import axios from 'axios'
import router from '../router/index'
import Vue from 'vue'

const forwardURL = '/api'
const forwardOtherURL = '/other'
// const forwardURL = ''
// const forwardOtherURL = ''

axios.defaults.timeout = 100000
axios.defaults.baseURL = forwardURL + '/'

function request (request) {
  if (request.url != 'auth') {
    request.headers.Authorization = localStorage.getItem('token')
  }
  return request
}

function requestError (error) {
  if (error) {
    let vue = new Vue()
    vue.$message({
      iconClass: 'a',
      customClass: 'msg-error',
      duration: 1500,
      dangerouslyUseHTMLString: true,
      message: `
        <div class="msg-box-cont show-error">
          <div class="msg-deco"><img :src="require('@img/title_deco.png')" /></div>
          <div class="msg-font"><p>请求失败 !</p><p>请检查本地网络连接 !</p></div>
          <div class="msg-deco"></div>
        </div>`
    })
  }
}

function response (response) {
  if (response.data.code == -1 && response.data.msg == 'diffToken') {
    router.push({path: '/'})
    return Promise.reject(response.data.msg)
  } else {
    return response
  }
}

function responseErr (error) {
  if (axios.isCancel(error)) { // 取消请求的情况下，终端Promise调用链
    return new Promise(() => {})
  } else {
    if (error.hasOwnProperty('response')) {
      if (error.response.status != 400) {
        let vue = new Vue()
        vue.$message({
          iconClass: 'a',
          customClass: 'msg-error',
          duration: 1500,
          dangerouslyUseHTMLString: true,
          message: `
            <div class="msg-box-cont show-error">
              <div class="msg-deco"><img :src="require('@img/title_deco.png')" /></div>
              <div class="msg-font"><p>请求失败 !</p><p>与服务器通信异常，请检查网络连接 !</p></div>
              <div class="msg-deco"></div>
            </div>`
        })
      }
    } else {
      let vue = new Vue()
      vue.$message({
        iconClass: 'a',
        customClass: 'msg-error',
        duration: 1500,
        dangerouslyUseHTMLString: true,
        message: `
          <div class="msg-box-cont show-error">
            <div class="msg-deco"><img :src="require('@img/title_deco.png')" /></div>
            <div class="msg-font"><p>请求异常 !</p><p>与服务器通信异常，请检查网络连接 !</p></div>
            <div class="msg-deco"></div>
          </div>`
      })
    }
  }
  /* if(error.code == 1){
    store.commit("clearUserInfo")
    router.push({name: "login"})
  }
  return Promise.reject(error) */
}

const axiosReq = axios.create({
  baseURL: forwardURL + '/openapi',
  headers: {
    'Content-Type': 'application/json;charset-UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
    // 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3eSIsImVtcElkIjoxMTExLCJJUCI6IjA6MDowOjA6MDowOjA6MSIsImVtcE5hbWUiOiLnjovlqpsiLCJleHAiOjE1NDczMzE5NTEsInVzZXJJZCI6ImZlMjZkYjIzNGQ4NDRiMTU4NWZjZTAwZjQ5N2RmNTE4In0._UuDoi5W1hPAQeozrk-2I_05WEPALF1LaDbDDOIyHkkbnKCISyQHqb84SDz75fG-1bY9beHESU2PulpeUn2QNQ'
  }
})
axiosReq.all = axios.all
axiosReq.spread = axios.spread
axiosReq.interceptors.request.use(request, requestError)
axiosReq.interceptors.response.use(response, responseErr)

const axiosNoneReq = axios.create({
  headers: {
    'Content-Type': 'application/json;charset-UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
    // 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3eSIsImVtcElkIjoxMTExLCJJUCI6IjA6MDowOjA6MDowOjA6MSIsImVtcE5hbWUiOiLnjovlqpsiLCJleHAiOjE1NDczMzE5NTEsInVzZXJJZCI6ImZlMjZkYjIzNGQ4NDRiMTU4NWZjZTAwZjQ5N2RmNTE4In0._UuDoi5W1hPAQeozrk-2I_05WEPALF1LaDbDDOIyHkkbnKCISyQHqb84SDz75fG-1bY9beHESU2PulpeUn2QNQ'
  }
})
axiosNoneReq.interceptors.request.use(request, requestError)
axiosNoneReq.interceptors.response.use(response, responseErr)

const axiosOtherReq = axios.create({
  baseURL: forwardOtherURL,
  headers: {
    'Content-Type': 'application/json;charset-UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
    // 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3eSIsImVtcElkIjoxMTExLCJJUCI6IjA6MDowOjA6MDowOjA6MSIsImVtcE5hbWUiOiLnjovlqpsiLCJleHAiOjE1NDczMzE5NTEsInVzZXJJZCI6ImZlMjZkYjIzNGQ4NDRiMTU4NWZjZTAwZjQ5N2RmNTE4In0._UuDoi5W1hPAQeozrk-2I_05WEPALF1LaDbDDOIyHkkbnKCISyQHqb84SDz75fG-1bY9beHESU2PulpeUn2QNQ'
  }
})
axiosOtherReq.interceptors.request.use(request, requestError)
axiosOtherReq.interceptors.response.use(response, responseErr)

const axiosDfs = axios.create({
  baseURL: forwardURL + '/',
  headers: {
    'Content-Type': 'application/json;charset-UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
  }
})
axiosDfs.interceptors.request.use(request, requestError)

const upload = axios.create({
  headers: {
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'x-requested-with,content-type'
  }
})
upload.interceptors.request.use(request, requestError)
upload.interceptors.response.use(response, responseErr)

export {axiosReq, axiosNoneReq, axiosOtherReq, axiosDfs, upload}
