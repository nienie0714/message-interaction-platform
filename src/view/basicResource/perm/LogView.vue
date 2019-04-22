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
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete">
      </Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit"></Edit-view>
    <Warning-box-view :data="deleteData" @handleConfirm="handleDeleteConfirm" @handleClose="handleDeleteClose"></Warning-box-view>
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
import {passwordReg, passwordReg418} from '../../../util/rules.js'
import {postData} from '../../../api/base.js'

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
      // 菜单对应按钮权限
      permissions: {
        add: true,
        update: true,
        delete: true,
        reset: true
      },
      // 基础路径
      baseUrl: '/sysLog',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'logId',
        formData: [
          {key: 'logId', label: '日志Id', type: 'input', isHidden: true, maxlength: 50},
          {key: 'logType', label: '日志类型', type: 'input', maxlength: 50},
          {key: 'logUser', label: '操作用户', type: 'input', maxlength: 50},
          {key: 'logSession', label: '登录会话', type: 'input', maxlength: 100},
          {key: 'logTime', label: '日志时间', type: 'input'},
          {key: 'logSource', label: '操作来源', type: 'input', maxlength: 100}, // 操作系统名称或客户端地址等
          {key: 'logSummary', label: '日志概述', type: 'input', maxlength: 100},
          {key: 'logDetail', label: '日志详细', type: 'input', maxlength: 500},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          logType: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          logUser: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          logTime: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          logSummary: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '用户名',
          key: 'logType',
          value: '',
          type: 'input',
          inputText: '用户名',
          span: 4
        },
        {
          // 'p': '用户名',
          key: 'logUser',
          value: '',
          type: 'input',
          inputText: '登录账号',
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
        key: 'logId',
        multipleSelection: [],
        fields: [
          {prop: 'logId', label: '日志Id', fixed: true, hidden: true},
          {prop: 'logType', label: '日志类型', fixed: true, hidden: false},
          {prop: 'logUser', label: '操作用户', fixed: true, hidden: false},
          {prop: 'logSession', label: '登录会话', fixed: true, hidden: false},
          {prop: 'logTime', label: '日志时间', fixed: true, hidden: false},
          {prop: 'logSource', label: '操作来源', fixed: true, hidden: false},
          {prop: 'logSummary', label: '日志概述', fixed: true, hidden: false},
          {prop: 'logDetail', label: '日志详细', fixed: true, hidden: false},
          {prop: 'remark', label: '备注', fixed: true, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', '')
        this.$set(this.formData.formData[i], 'isHidden', false)
        if (this.formData.formData[i].key == 'newPassword') {
          this.formData.formData[i].isHidden = true
        } else if (this.formData.formData[i].key == 'userName') {
          this.$set(this.formData.formData[i], 'type', 'input')
          this.$set(this.formData.formData[i], 'isHidden', false)
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password' || this.formData.formData[i].key == 'newPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        } else {
          this.$set(this.formData.formData[i], 'isHidden', false)
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    customSaveBefore (data) {
      var obj = {}
      if (this.formData.title == '编辑') {
        obj = JSON.parse(JSON.stringify(data))
        this.$delete(obj, 'password')
        this.$delete(obj, 'newPassword')
      }
      if (this.formData.title == '新增') {
        obj = JSON.parse(JSON.stringify(data))
      }
      return obj
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password' || this.formData.formData[i].key == 'newPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        } else if (this.formData.formData[i].key == 'userName') {
          this.$set(this.formData.formData[i], 'type', 'pInput')
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else {
          this.$set(this.formData.formData[i], 'isHidden', false)
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    }
  }
}
</script>
