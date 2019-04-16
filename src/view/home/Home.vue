<template>
  <div class="body-view">
    <el-container direction="vertical" ref="homeBodyViewContainer">
      <div class="home-return-main-img" @click="returnMainPage()"></div>
      <header-view @select="handleHeaderMenu"></header-view>
      <el-main :class="((routerViewName!='航班查询')&&(routerViewName!='任务调度'))?'home-top-main':''">
        <el-container class="home-container-cent">
          <div v-if="['/basicdata', '/statistics'].includes(basicPath)" style="display: flex;">
            <Aside-menu-view></Aside-menu-view>
            <el-main class="home-main">
              <router-view/>
            </el-main>
          </div>
          <router-view v-else/>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import AsideMenuView from './AsideMenuView'
import HeaderView from './HeaderView'

export default {
  components: {
    AsideMenuView,
    HeaderView
  },
  data () {
    return {
      basicPath: '',
      // 命名视图名称
      routerViewName: this.$route.name
    }
  },
  created () {
    this.basicPath = this.$route.matched[0].path
  },
  methods: {
    returnMainPage () {
      if (window.opener && !window.opener.closed) {
        const {href} = this.$router.resolve({
          name: window.opener.name
        })
        window.open(href, window.opener.name)
      } else {
        this.$router.push({name: '主页面'})
      }
    },
    handleHeaderMenu (data) {
      this.$router.push({name: data.key})
    }
  },
  watch: {
    $route (to, from) {
      this.routerViewName = to.name
    }
  }/* ,
  mounted () {
    const that = this
    this.$nextTick(() => {
      const containerWidth = that.$el.querySelector('.flight-contain')
      containerWidth.style.width = window.innerWidth
      window.onresize = () => {
        this.$nextTick(() => {
          return (() => {
            const containerWidth = that.$el.querySelector('.flight-contain')
            containerWidth.style.width = window.innerWidth
          })()
        })
      }
    })
  } */
}
</script>

<style>
.body-view {
  background: url(../../assets/img/bg.jpg);
}
.home-return-main-img {
  height: 48px;
  width: 48px;
  position: absolute;
  top: 0;
  right: 0;
  background-image: url(../../assets/img/btn_home.png);
  z-index: 99;
  cursor: pointer;
}
</style>
