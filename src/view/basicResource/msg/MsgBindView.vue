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
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload">
          <template slot="button-slot-scope">
            <div v-if="permissions.bind" class="tool-div-button tool-bind" @click="handleBind"></div>
          </template>
        </Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit"></Table-view>
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
import basicMsgMixin from '../../../components/mixin/basicMsgMixin'
import { queryAll, postData } from '../../../api/base.js'
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
  mixins: [basicTableMixin, pageTableMixin, basicMsgMixin],
  data () {
    return {
      // 菜单对应按钮权限
      permissions: {
        add: false,
        update: false,
        delete: false,
        export: false,
        bind: false
      },
      // 基础路径
      baseUrl: 'message/aomsMsgTypeSubscribe',
      // 编辑路径
      editUrl: 'message/aomsMsgTypeSubscribe/batchUpdate',
      // 一键绑定路径
      bindUrl: 'message/aomsMsgTypeSubscribe/synchronizeMQBindings',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        width: '680px',
        className: 'twiceCol',
        groupKey: ['empId', 'msgTypeId'],
        groupKeyUrl: 'message/aomsMsgTypeSubscribe/queryAll',
        formData: [
          {key: 'empId', label: '员工ID', type: 'pInput', isHidden: true},
          {key: 'msgTypeId', label: '已绑消息ID', type: 'pInput', isHidden: true},
          {key: 'deptName', label: '部门', type: 'pInput', class: 'auto-width'},
          {key: 'empIdS', label: '员工', type: 'tree', defaultExpand: true, showCheckbox: true, filterButton: true, class: 'tree-filter', getOptions: '/message/aomsMsgTypeSubscribe/queryDepartmentEmployeeTree', saveKey: 'empIds', itemKey: 'id', props: {value: 'id', label: 'text', children: 'children'}},
          {key: 'msgTypeIdS', label: '已绑消息', type: 'tree', defaultExpand: true, showCheckbox: true, getOptions: '/message/aomsMsgDef/queryAomsMsgDefTree', saveKey: 'msgTypeIds', itemKey: 'id', props: {value: 'id', label: 'text', children: 'children'}}
        ],
        rules: {
        }
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '员工',
          key: 'empId',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '员工',
          getOptions: '/organization/employee/queryAll',
          optKey: 'empId',
          optLabel: 'empName',
          span: 3
        }, {
          // 'p': '部门',
          key: 'deptName',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '部门',
          getOptions: '/organization/department/queryRecursionAll',
          span: 3
        }, {
          // 'p': '已绑消息',
          key: 'msgTypeSubNo',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '已绑消息',
          getOptions: '/message/aomsMsgDef/getMsgTypeSub',
          optKey: 'msgTypeSubNo',
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
        // type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        multipleSelection: [],
        fields: [
          {prop: 'empNo', label: '员工编号', fixed: true, hidden: false},
          {prop: 'empName', label: '员工名称', fixed: false, hidden: false},
          {prop: 'deptName', label: '部门', fixed: false, hidden: false},
          {prop: 'msgTypeSubCnStr', label: '已绑消息', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    // 查询后的自定义方法
    customAfterQuery () {
      this.tableData.data.forEach(item => {
        if (item.hasOwnProperty('msgTypeSubCns')) {
          this.$set(item, 'msgTypeSubCnStr', item.msgTypeSubCns ? item.msgTypeSubCns.join(',') : '')
        }
      })
    },
    // 一键绑定
    handleBind () {
      postData(this.bindUrl, {}).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('一键绑定')
        } else {
          this.showError('一键绑定', '请联系管理员 !')
        }
      })
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (['empIdS', 'msgTypeIdS'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'optionsQuery', row['empId'])
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (['empIdS', 'msgTypeIdS'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'optionsQuery', row['empId'])
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    }
  }
}
</script>
