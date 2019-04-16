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
import {idReg, threeD} from '../../../util/rules.js'
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
      baseUrl: 'basicdata/abnormalreason',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'reasonCode',
        formData: [
          {key: 'reasonCode', label: '原因代码', type: 'input', class: 'auto-margin', toUpper: true, maxlength: 10},
          {key: 'nameC', label: '中文描述', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'nameE', label: '英文描述', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'classify', label: '原因分类', type: 'select', filterable: true, tabsKey: 'abnormalReason', itemKey: 'key', itemLabel: 'value'},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          reasonCode: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          nameC: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          reserved1: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '原因代码',
          key: 'reasonCode',
          value: '',
          type: 'input',
          inputText: '原因代码',
          toUpper: true,
          span: 3
        }, {
          // 'p': '原因分类',
          key: 'classify',
          tabsKey: 'abnormalReason',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'key',
          optLabel: 'value',
          inputText: '原因分类',
          'valueChange': 'attrChange',
          'span': 4
        }, {
          // 'p': '原因描述',
          key: 'nameC',
          value: '',
          type: 'input',
          inputText: '原因描述',
          span: 5
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
        key: 'reasonCode',
        multipleSelection: [],
        fields: [
          {prop: 'reasonCode', label: '原因代码', fixed: true, hidden: false},
          {prop: 'nameC', label: '中文描述', fixed: false, hidden: false},
          {prop: 'nameE', label: '英文描述', fixed: false, hidden: false},
          {prop: 'classify', label: '原因分类', fixed: false, hidden: false, optionKey: 'abnormalReason'}
        ]
      }
    }
  },
  methods: {
  }
}
</script>

<style scope>
</style>
