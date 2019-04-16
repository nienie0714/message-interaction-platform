<template>
  <el-container class="tree">
    <el-aside width="250px">
      <el-input placeholder="请输入部门" v-model.trim="deptId" clearable style="margin-left: 20px; width: 80%;"><!--  suffix-icon="el-icon-search" -->
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <el-tree :data="data" :props="props" :default-expanded-keys="defaultExpand" node-key="id"
      :filter-node-method="filterNode" @node-click="handleNodeClick" :expand-on-click-node="false"
      class="dept-tree" ref="deptTree"></el-tree>
    </el-aside>
    <Dept-view :deptParentId="deptParentId"></Dept-view>
  </el-container>
</template>

<script>
import DeptView from './DeptView'
import {postData} from '../../../api/base.js'

export default {
  components: {
    DeptView
  },
  data () {
    return {
      // 基础路径
      baseUrl: 'organization/department',
      queryUrl: '/queryDeptTreeByUserId',
      data: [],
      defaultExpand: [],
      props: {value: 'id', label: 'text', children: 'children'},
      deptId: '',
      deptParentId: null
    }
  },
  created () {
    this.updateTree()
  },
  mounted () {
    this.$transfer.$on('updateTree', () => this.updateTree())
  },
  methods: {
    updateTree () {
      let _this = this
      postData(this.baseUrl + this.queryUrl, {}).then(response => {
        if (response.data.code == 0) {
          _this.data = response.data.data
          _this.data.forEach(item => {
            if (item.hasOwnProperty('children')) {
              _this.defaultExpand.push(item.id)
            }
          })
        }
      })
    },
    handleNodeClick (data) {
      this.deptParentId = data.id
    },
    filterNode (value, data) {
      if (!value) {
        return true
      }
      return data.text.indexOf(value) !== -1
    }
  },
  watch: {
    deptId (val) {
      this.$refs.deptTree.filter(val)
    }
  }
}
</script>

<style>
.dept-tree {
  margin: 10px;
  border-radius: 5px;
  background: none;
}
</style>
