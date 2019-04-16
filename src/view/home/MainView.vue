<template>
  <div class="main-page">
    <div class="main-header">
      <div class="logo-header">
        <img :src="require('@img/logo_header.png')"/>
      </div>
      <div class="latest-bg main-latest-bg">
        <div class="latest-time">{{ latestTime }}</div>
      </div>
    </div>
    <div class="main-main">
      <div class="main-main-div">
        <div class="main-say-hi">您好，今天是{{latestDate.split('/')[0]}}年{{latestDate.split('/')[1]}}月{{latestDate.split('/')[2]}}日，星期{{latestWeek}}</div>
        <div class="main-say-hello">请点击功能模块开始使用系统</div>
        <div class="main-module-div">
          <div class="main-module">
            <div v-for="item in topResource" :key="item.resourceId" class="module-card" @click="handlePage(item.name)">
              <div :class="'card-img ' + item.icon"></div>
              <div class="card-title">{{item.name}}</div>
              <div class="card-mark"></div>
            </div>
            <!-- <div class="module-card" @click="handlePage('指挥监控')">
              <div class="card-img card-commond"></div>
              <div class="card-title">指挥监控</div>
              <div class="card-mark"></div>
            </div>
            <div class="module-card" @click="handlePage('任务调度')">
              <div class="card-img card-task"></div>
              <div class="card-title">任务调度</div>
              <div class="card-mark"></div>
            </div>
            <div class="module-card" @click="handlePage('航班查询')">
              <div class="card-img card-flight"></div>
              <div class="card-title">航班查询</div>
              <div class="card-mark"></div>
            </div>
            <div class="module-card" @click="handlePage('基础数据')">
              <div class="card-img card-basic"></div>
              <div class="card-title">基础数据</div>
              <div class="card-mark"></div>
            </div> -->
            <!-- <div class="module-card" @click="handlePage('数据统计')">
              <div class="card-img card-data"></div>
              <div class="card-title">数据统计</div>
              <div class="card-mark"></div>
            </div> -->
            <div class="module-card">
              <div class="card-img card-user"></div>
              <div class="card-font-user">{{empName?empName:''}}</div>
              <div class="card-font-team">{{teamName?teamName:''}}</div>
              <div class="card-title">个人中心</div>
              <div class="card-mark"></div>
            </div>
          </div>
        </div>
        <div class="logout-button" @click="handleLogout()">
          <div>
            <div class="logout-img"></div>
            <div class="logout-font">退出系统</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseMixin from '../../components/mixin/baseMixin'
import {postData} from '../../api/base.js'

export default {
  mixins: [baseMixin],
  data () {
    return {
      empName: '',
      teamName: '',
      basicOpenWin: null,
      statOpenWin: null,
      topResource: []
    }
  },
  mounted () {
    window.name = this.$route.name
    this.empName = localStorage.getItem('empName')
    this.teamName = localStorage.getItem('teamName')
    postData('basicdata/sysUser/queryTopResource', {}).then(response => {
      this.topResource = response.data.data
    })
  },
  methods: {
    handlePage (name) {
      if (name == '基础数据') {
        if (this.basicOpenWin && this.basicOpenWin.closed) {
          localStorage.removeItem('basicName')
        } else {
          var basicName = localStorage.getItem('basicName')
          if (basicName) {
            name = basicName
          }
        }
        const {href} = this.$router.resolve({
          name: name
        })
        this.basicOpenWin = window.open(href, name)
      } else if (name == '数据统计') {
        if (this.statOpenWin && this.statOpenWin.closed) {
          localStorage.removeItem('statName')
        } else {
          var statName = localStorage.getItem('statName')
          if (statName) {
            name = statName
          }
        }
        const {href} = this.$router.resolve({
          name: name
        })
        this.statOpenWin = window.open(href, name)
      } else if (name == '指挥监控') {
        window.open('/dynamicmap', name)
      } else {
        const {href} = this.$router.resolve({
          name: name
        })
        window.open(href, name)
      }
    },
    handleLogout () {
      this.$router.push('/')
    }
  }
}
</script>

<style>
.main-page {
  height: 100%;
  position: relative;
  text-align: center;
  background-size: cover;
  background-image: url('../../assets/img/entrance_bg.jpg');
}
.main-header {
  text-align: left;
  padding: 20px 0 0 30px;
}
.main-latest-bg {
  top: 20px;
  right: 30px;
}
.main-main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: absolute;
  top: 0;
  width: 100%;
}
.main-main-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-say-hi {
  height: 40px;
  line-height: 40px;
  color: #fff;
  font-size: 40px;
  font-weight: lighter;
}
.main-say-hello {
  height: 20px;
  line-height: 20px;
  color: #3ca6c8;
  font-size: 20px;
  margin: 20px 0 50px 0;
}
.main-module-div {
  display: flex;
  justify-content: center;
  width: calc(100vw - 40px);
}
.main-module {
  height: 380px;
  display: flex;
  overflow-y: hidden;
}
.module-card {
  height: 360px;
  width: 280px;
  /* width: 240px; */
  background: url('../../assets/img/entrance_card_bg.png');
  background-color: rgba(9, 20, 31, 0.6);
  border: 1px solid rgba(60, 166, 200, 0.7);
  box-shadow: 0 0 50px rgba(60, 166, 200, 0.3) inset, 0 20px 80px rgba(9, 20, 31, 0.9);
  border-radius: 16px;
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.module-card:hover {
  border-color: rgba(60, 166, 200, 0.9);
  box-shadow: 0 0 100px rgba(60, 166, 200, 0.5) inset, 0 20px 80px rgba(9, 20, 31, 0.9);
}
.main-module .module-card:last-child {
  background: url('../../assets/img/bg_usr_center.png');
  margin-right: 0;
  cursor: auto;
}
.main-module>.module-card>.card-img {
  width: 200px;
  height: 200px;
  margin: 60px 0 20px 0;
}
.main-module>.module-card:last-child>.card-img {
  width: 100px;
  height: 100px;
  margin: 80px 0 20px 0;
}
.main-module>.module-card .card-title {
  color: #fff;
  font-size: 24px;
  height: 24px;
  line-height: 24px;
  margin-bottom: 16px;
}
.module-card>.card-font-user {
  height: 18px;
  line-height: 18px;
  font-size: 18px;
  color: #fff;
  text-align: center;
  margin-bottom: 10px;
}
.module-card>.card-font-team {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  color: #3ca6c8;
  text-align: center;
  margin-bottom: 36px;
}
.main-module>.module-card .card-mark {
  background-color: #51b7ff;
  width: 30px;
  height: 6px;
  margin: 0 125px;
}
.logout-button {
  margin-top: 80px;
  width: 400px;
  height: 60px;
  background: rgba(230, 80, 105, 0.2);
  border: 1px solid rgba(230, 80, 105, 0.7);
  box-shadow: 0 0 20px rgba(230, 80, 105, 0.3) inset;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.logout-button:hover {
  opacity: 0.8;
}
.logout-button>div {
  display: flex;
}
.logout-button>div .logout-img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background: url('../../assets/img/icon_log_out.png');
}
.logout-button>div .logout-font {
  font-size: 18px;
  line-height: 18px;
  color: #fff;
}
.card-commond {
  background: url('../../assets/img/icon_entrance_commond.png');
}
.card-task {
  background: url('../../assets/img/icon_entrance_task.png');
}
.card-flight {
  background: url('../../assets/img/icon_entrance_flight.png');
}
.card-basic {
  background: url('../../assets/img/icon_entrance_basic.png');
}
.card-data {
  background: url('../../assets/img/icon_entrance_data.png');
}
.card-user {
  background: url('../../assets/img/icon_usr_photo.png');
}
</style>
