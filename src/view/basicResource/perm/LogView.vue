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
        <!-- <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload" @handleAdd="handleAdd" @handleDelete="handleDelete"></Tool-button-view> -->
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable"></Table-view>
    </el-main>
    <Edit-view :formData="formData"></Edit-view>
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
        add: false,
        update: false,
        delete: false,
        reset: false
      },
      // 基础路径
      baseUrl: 'manage/sysLog',
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
          inputText: '日志类型',
          span: 4
        },
        {
          // 'p': '用户名',
          key: 'logUser',
          value: '',
          type: 'input',
          inputText: '操作用户',
          span: 4
        }
        // , {
        //   // 'p': '开始时间',
        //   key: 'beginDate',
        //   value: null,
        //   type: 'date',
        //   editable: false,
        //   clearable: true,
        //   inputText: '开始时间',
        //   valueFormat: 'yyyy-MM-dd',
        //   span: 3
        // }, {
        //   // 'p': '结束时间',
        //   key: 'endDate',
        //   value: null,
        //   type: 'date',
        //   editable: false,
        //   clearable: true,
        //   inputText: '结束时间',
        //   valueFormat: 'yyyy-MM-dd',
        //   span: 3
        // }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        type: 'selection',
        isOperat: true,
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'logId',
        multipleSelection: [],
        fields: [
          {prop: 'logId', label: '日志Id', hidden: true},
          {prop: 'logUser', label: '操作用户', hidden: false},
          {prop: 'logType', label: '日志类型', hidden: false},
          // {prop: 'logSession', label: '登录会话', hidden: false},
          // {prop: 'logSource', label: '操作来源', hidden: false},
          {prop: 'logSummary', label: '日志概述', hidden: false},
          {prop: 'logDetail', label: '日志详细', hidden: false},
          {prop: 'logTime', label: '记录时间', hidden: false, formatter: this.formatterDayMin}
          // {prop: 'remark', label: '备注', hidden: false}
        ]
      }
    }
  },
  methods: {
  }
}
</script>
