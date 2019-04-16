<template>
  <el-container direction="vertical">
    <el-header class="query-contain">
      <Query-view :data="queryRowGroup" class="left" @keyupEnter="queryDataReq()"></Query-view>
      <div class="left-button">
        <el-button type="info" icon="el-icon-search" plain @click="cleanQueryData()">清空</el-button>
        <el-button type="primary" icon="el-icon-search" @click="queryDataReq()">查询</el-button>
      </div>
    </el-header>
    <el-main class="page-table-view">
      <div class="page-table-header">
        <div class="page-table-title">查询结果</div>
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload" @handleAdd="handleAdd" @handleDelete="handleDelete"></Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete"></Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit"></Edit-view>
    <Warning-box-view :data="deleteData" @handleConfirm="handleDeleteConfirm"></Warning-box-view>
  </el-container>
</template>

<script>
import QueryView from '../../../components/common/QueryView'
import PaginationView from '../../../components/common/PaginationView'
import TableView from '../../../components/common/BaseTableView'
import ToolButtonView from '../../../components/common/ToolButtonView'
import EditView from '../../../components/common/EditView'
import basicTableMixin from '../../../components/mixin/basicTableMixin'
import pageTableMixin from '../../../components/mixin/pageTableMixin'
import {idNumReg, phoneReg} from '../../../util/rules.js'
import {queryAll} from '../../../api/base.js'

// const tableHeight = ''

export default {
  components: {
    QueryView,
    PaginationView,
    TableView,
    ToolButtonView,
    EditView
  },
  mixins: [basicTableMixin, pageTableMixin],
  data () {
    return {
      // 基础路径
      baseUrl: 'taskbasic/taskRole',
      // 新增路径
      addUrl: '/batchSave',
      // 编辑路径
      editUrl: '/batchUpdate',
      // 编辑路径
      deleteUrl: '/batchDelete',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'taskRoleId',
        clearRulesKey: ['name'],
        formData: [
          {key: 'taskRoleId', label: '任务角色编号', type: 'input', maxlength: 20, isHidden: true},
          {key: 'name', label: '任务角色名称', type: 'input', maxlength: 20},
          {key: 'permission', label: '任务角色权限', type: 'tabs', tabsKey: 'taskRolePerm'},
          {key: 'taskNames', label: '任务', type: 'tree', showCheckbox: true, class: 'auto-width', getOptions: '/taskbasic/taskRole/querySelectedTask', saveKey: 'taskNos', itemKey: 'taskNo', props: {label: 'taskName', children: 'children'}}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          description: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '任务角色',
          key: 'taskRoleId',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'taskRoleId',
          optLabel: 'name',
          inputText: '任务角色',
          getOptions: 'permission/taskbasic/taskRole/queryAll',
          span: 4
        }, {
          // 'p': '任务',
          key: 'taskNo',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'taskNo',
          optLabel: 'taskCn',
          inputText: '任务',
          getOptions: 'taskbasic/tasks/queryAll',
          span: 4
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'taskRoleId',
        multipleSelection: [],
        fields: [
          {prop: 'name', label: '任务角色名称', fixed: true, hidden: false},
          {prop: 'permission', label: '任务角色权限', fixed: true, hidden: false},
          {prop: 'taskNameStr', label: '任务', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  created () {
    this.addUrl = this.baseUrl + this.addUrl
    this.editUrl = this.baseUrl + this.editUrl
    this.deleteUrl = this.baseUrl + this.deleteUrl
  },
  methods: {
    // 查询后的自定义方法
    customAfterQuery () {
      this.tableData.data.forEach(item => {
        if (item.hasOwnProperty('taskNames')) {
          this.$set(item, 'taskNameStr', item.taskNames.join(','))
        }
      })
    },
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'taskRoleId') {
          queryAll(item.getOptions, {}).then(response => {
            if (response.data.code == 0) {
              this.$set(item, 'options', response.data.data)
            }
          })
        }
      })
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'taskNames') {
          let data = {
            'taskRoleId': row['taskRoleId']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'taskNames') {
          let data = {
            'taskRoleId': row['taskRoleId']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    }
  }
}
</script>
