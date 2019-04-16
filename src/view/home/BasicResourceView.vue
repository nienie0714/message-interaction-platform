<template>
  <div class="basic-resource-contain table-container">
    <el-container direction="vertical">
      <el-header>
        <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>基础资源</el-breadcrumb-item>
          <el-breadcrumb-item @click="changeRouterViewName('stand')">停机位管理</el-breadcrumb-item>
        </el-breadcrumb> -->
        <div class="table-header">
          <img :src="require('@img/title_deco.png')" />
          <span class="header-title">{{ routerViewName }}</span>
          <div class="header-update-div">
            <div>最后更新时间：</div>
            <div>{{lastUpdateTime}}</div>
            <div class="header-refrush">
              <div class="img-refrush" @click="handleLetUpdate"></div>
              </div>
          </div>
        </div>
      </el-header>
      <el-main>
        <div class="basic-resource-main">
          <router-view v-if="$route.matched[0].path == '/basicdata'" ref="basicRouter"></router-view>
          <router-view v-else ref="statRouter"></router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      // 命名视图名称
      routerViewName: ''
    }
  },
  mounted () {
    window.name = this.$route.name
    if (this.$route.matched[0].path == '/basicdata') {
      this.routerViewName = localStorage.getItem('basicdataName')
    } else {
      this.routerViewName = localStorage.getItem('statisticsName')
    }
  },
  methods: {
    changeRouterViewName (keyName) {
      this.$router.push({name: keyName})
    },
    handleLetUpdate () {
      this.$refs.basicRouter.queryDataReq()
    }
  },
  watch: {
    $route (to, from) {
      this.routerViewName = localStorage.getItem('basicdataName')
    }
  },
  computed: {
    lastUpdateTime () {
      return this.$store.getters.getLastUpdateTime
    }
  }
}
</script>

<style scoped>
.el-main {
  padding: 0
}
.el-main .basic-resource-main {
  height: 100%;
}
.basic-resource-contain {
  height: calc(100% - 2px);
}
</style>
