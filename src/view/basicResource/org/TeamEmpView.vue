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
      baseUrl: 'organization/teamemployee',
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '班组',
          key: 'teamId',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '班组',
          getOptions: '/organization/team/queryAllByUser',
          optKey: 'teamId',
          optLabel: 'teamName',
          filterKeys: ['teamId', 'teamName'],
          span: 4
        }, {
          // p: '员工',
          key: 'empId',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '员工',
          getOptions: '/organization/employee/queryAllByEmpId',
          optKey: 'empId',
          optLabel: 'empName',
          filterKeys: ['empId', 'empName'],
          span: 4
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        isOperat: 1,
        data: [],
        stripe: true,
        height: window.innerHeight,
        // type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'teamEmpId',
        multipleSelection: [],
        fields: [
          {prop: 'teamEmpId', label: '班组成员编号', fixed: true, hidden: false},
          {prop: 'empName', label: '员工名称', fixed: false, hidden: false},
          {prop: 'teamName', label: '班组名称', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
  }
}
</script>
