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
      <Table-view :permissions="permissions" :tableData="tableData" @change="tableChange" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete"></Table-view>
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
      baseUrl: 'taskbasic/reEmpTaskRole',
      // 新增路径
      addUrl: '/batchSave',
      // 编辑路径
      editUrl: '/batchSave',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'empId',
        formData: [
          {key: 'deptIds', label: '部门', type: 'casc', clearable: true, class: 'auto-width', getOptions: '/organization/department/queryDeptTreeByUserId', props: {value: 'id', label: 'text', children: 'children'}, options: [], defaultValue: true, change: this.changeDept},
          {key: 'deptName', label: '部门', type: 'pInput'},
          {key: 'empId', label: '员工', type: 'select', filterable: true, itemKey: 'empId', itemLabel: 'empName'},
          {key: 'empName', label: '员工', type: 'pInput'},
          {key: 'taskRoleIds', label: '任务角色', type: 'select', filterable: true, multiple: true, class: 'auto-width', getOptions: '/taskbasic/taskRole/queryAll', itemKey: 'taskRoleId', itemLabel: 'name', autosize: true}
        ],
        rules: {
          empId: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          taskRoleIds: [
            {required: true, message: '必填项', trigger: 'change'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '员工',
          key: 'empId',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'empId',
          optLabel: 'empName',
          inputText: '员工',
          getOptions: '/organization/employee/queryAll',
          span: 4
        }, {
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
        key: 'empId',
        multipleSelection: [],
        fields: [
          {prop: 'empName', label: '员工', fixed: true, hidden: false},
          {prop: 'deptName', label: '部门', fixed: true, hidden: false},
          {prop: 'taskRoleNameStr', label: '任务角色', fixed: true, hidden: false, overflow: true},
          {prop: 'taskNameStr', label: '任务', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  created () {
    this.addUrl = this.baseUrl + this.addUrl
    this.editUrl = this.baseUrl + this.editUrl
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'empId') {
            this.$set(this.formData.formData[i], 'optionsQuery', {'empId': data.currentRow.empId})
          }
        }
      }
    },
    // 查询后的自定义方法
    customAfterQuery () {
      this.tableData.data.forEach(item => {
        if (item.hasOwnProperty('taskRoleNames')) {
          this.$set(item, 'taskRoleNameStr', item.taskRoleNames.join(','))
        }
        if (item.hasOwnProperty('taskNames')) {
          this.$set(item, 'taskNameStr', item.taskNames.join(','))
        }
      })
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['deptIds', 'empId'].includes(this.formData.formData[i].key)) {
          this.$delete(this.formData.formData[i], 'isHidden')
        }
        if (['deptName', 'empName'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (['deptIds', 'empId'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
        if (['deptName', 'empName'].includes(this.formData.formData[i].key)) {
          this.$delete(this.formData.formData[i], 'isHidden')
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (['deptIds', 'empId'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
        if (['deptName', 'empName'].includes(this.formData.formData[i].key)) {
          this.$delete(this.formData.formData[i], 'isHidden')
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    },
    changeDept (value, callback) {
      queryAll('/organization/employee/queryEmployeeForReEmpTaskRole', {'deptId': value}).then(response => {
        let emp = {
          key: 'empId',
          value: null
        }
        if (response.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].key == 'empId') {
              this.$set(this.formData.formData[i], 'options', response.data.data)
              callback(emp)
              return
            }
          }
        } else {
          callback(emp)
          return null
        }
      })
    }
  }
}
</script>
