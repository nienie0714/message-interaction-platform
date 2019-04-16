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
import _ from 'lodash'
import { queryAll } from '../../../api/base.js'
import {twoDecimal, threeD, phoneReg, maxENReg} from '../../../util/rules.js'

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
      baseUrl: 'message/aomsMsgRecord',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'msgSenderName', label: '发送者', type: 'pInput'},
          {key: 'msgReceiverName', label: '接收者', type: 'pInput'},
          {key: 'chatGroupCn', label: '群组', type: 'pInput'},
          {key: 'msgTypeCn', label: '消息类型', type: 'pInput'},
          {key: 'msgTypeSubCn', label: '消息子类型', type: 'pInput'},
          {key: 'msgSendTime', label: '发送时间', type: 'pInput'},
          {key: 'msgReceiveTime', label: '接收时间', type: 'pInput'},
          {key: 'msgConfirmTime', label: '确认时间', type: 'pInput'},
          {key: 'msgContent', label: '消息内容', type: 'textarea', class: 'auto-height auto-width', autosize: {minRows: 1, maxRows: 4}}
        ]
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '接收者',
          key: 'msgReceiver',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '接收者',
          getOptions: '/organization/employee/queryAllByEmpId',
          optKey: 'empId',
          optLabel: 'empName',
          span: 3
        }, {
          // 'p': '发送者',
          key: 'msgSender',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '发送者',
          getOptions: '/organization/employee/queryAllByEmpId',
          optKey: 'empId',
          optLabel: 'empName',
          options: [
            {
              empId: -1,
              empName: 'AOMS'
            },
            {
              empId: -2,
              empName: 'FIMS'
            }
          ],
          span: 3
        }, {
          // 'p': '群组',
          key: 'chatGroupId',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '群组',
          getOptions: '/message/aomsChatGroup/queryAll',
          optKey: 'chatGroupId',
          optLabel: 'chatGroupCn',
          span: 3
        }, {
          // 'p': '发送时间',
          key: 'msgSendTime',
          value: null,
          type: 'date',
          editable: false,
          clearable: true,
          inputText: '发送时间',
          valueFormat: 'yyyy-MM-dd',
          span: 3
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        // type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        multipleSelection: [],
        fields: [
          {prop: 'msgSenderName', label: '发送者', fixed: true, hidden: false},
          {prop: 'msgReceiverName', label: '接收者', fixed: false, hidden: false},
          {prop: 'chatGroupCn', label: '群组', fixed: false, hidden: false},
          {prop: 'msgTypeCn', label: '消息类型', fixed: false, hidden: false},
          {prop: 'msgTypeSubCn', label: '消息子类型', fixed: false, hidden: false},
          {prop: 'msgSendTime', label: '发送时间', fixed: false, hidden: false, formatter: this.formatterDayMin},
          {prop: 'msgReceiveTime', label: '接收时间', fixed: false, hidden: false, formatter: this.formatterDayMin},
          {prop: 'msgConfirmTime', label: '确认时间', fixed: false, hidden: false, formatter: this.formatterDayMin},
          {prop: 'msgContent', label: '消息内容', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    customQueryBefore () {
      if (this.queryData.msgSendTime) {
        this.queryData.msgSendTime += ' 00:00:00'
      }
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['msgSendTime', 'msgReceiveTime', 'msgConfirmTime'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key] ? row[this.formData.formData[i].key].substr(0, 16) : '')
        } else {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    }
  }
}
</script>
