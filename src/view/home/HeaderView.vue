<template>
  <div class="header-menu" ref="homeHeader">
    <el-header style="height: 80px; font-size: 12px">
      <!-- <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" >
        <el-menu-item index="flight">航班查询</el-menu-item>
        <el-submenu index="basic">
          <template slot="title">基础数据</template>
          <el-menu-item index="stand">机位管理</el-menu-item>
        </el-submenu>
      </el-menu> -->
      <div class="logo-header">
        <img :src="require('@img/logo_header.png')"/>
      </div>
    </el-header>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: 'flight'
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      this.$emit('select', {
        key: key,
        keyPath: keyPath
      })
    }
  }
}
</script>

<style>
.logo-header {
  padding-left: 20px;
  padding-top: 15px;
}
/* .header-menu .el-header{
  background-color: none
} */
/* .header-menu .el-header .el-menu{
  background-color: #545c64
  /* background-color: rgb(84, 92, 100, 0)
} */
</style>
