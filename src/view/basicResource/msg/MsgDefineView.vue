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
      baseUrl: 'message/aomsMsgDef',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        groupKey: ['msgTypeNo', 'msgTypeSubNo'],
        groupKeyUrl: 'message/aomsMsgDef/queryAll',
        formData: [
          {key: 'msgTypeId', label: '消息类型ID', type: 'pInput', isHidden: true},
          {key: 'msgTypeNo', label: '消息类型编号', type: 'input', maxlength: 50},
          {key: 'msgTypeCn', label: '消息类型名称', type: 'input', maxlength: 50},
          {key: 'msgTypeSubNo', label: '消息子类型编号', type: 'input', maxlength: 50},
          {key: 'msgTypeSubCn', label: '消息子类型名称', type: 'input', maxlength: 50},
          {key: 'msgPubType', label: '消息发布类型', type: 'tabs', tabsKey: 'msgType', options: []},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          msgTypeNo: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          msgTypeCn: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          msgTypeSubNo: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          msgTypeSubCn: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '消息类型',
          key: 'msgTypeCn',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '消息类型',
          getOptions: '/message/aomsMsgDef/getMsgType',
          optKey: 'msgTypeCn',
          optLabel: 'msgTypeCn',
          span: 3
        }, {
          // 'p': '消息子类型',
          key: 'msgTypeSubCn',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '消息子类型',
          getOptions: '/message/aomsMsgDef/getMsgTypeSub',
          optKey: 'msgTypeSubCn',
          optLabel: 'msgTypeSubCn',
          span: 3
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
        key: 'msgTypeId',
        multipleSelection: [],
        fields: [
          {prop: 'msgTypeNo', label: '消息类型编号', fixed: true, hidden: false},
          {prop: 'msgTypeCn', label: '消息类型名称', fixed: false, hidden: false},
          {prop: 'msgTypeSubNo', label: '消息子类型编号', fixed: false, hidden: false},
          {prop: 'msgTypeSubCn', label: '消息子类型名称', fixed: false, hidden: false},
          {prop: 'msgPubType', label: '消息发布类型', fixed: false, hidden: false, optionKey: 'msgType'}
        ]
      }
    }
  },
  methods: {
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'msgTypeCn') {
          queryAll(item.getOptions, {}).then(response => {
            if (response.data.code == 0) {
              this.$set(item, 'options', response.data.data)
            }
          })
        } else if (item.key == 'msgTypeSubCn') {
          queryAll(item.getOptions, {}).then(response => {
            if (response.data.code == 0) {
              this.$set(item, 'options', response.data.data)
            }
          })
        }
      })
    }
  }
}
</script>
