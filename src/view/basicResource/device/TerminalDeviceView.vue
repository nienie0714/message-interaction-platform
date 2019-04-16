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
import {maxENReg, threeD, phoneReg} from '../../../util/rules.js'
import {queryAll} from '../../../api/base.js'
import _ from 'lodash'

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
      baseUrl: 'basicdata/handheldterminal',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'deviceNo',
        formData: [
          {key: 'deviceNo', label: '设备编号', type: 'input', toUpper: true, maxlength: 20},
          {key: 'deviceModel', label: '设备型号', type: 'input'},
          {key: 'deviceType', label: '设备类型', type: 'select', filterable: true, tabsKey: 'deviceType', itemKey: 'key', itemLabel: 'value'},
          {key: 'versionNumber', label: '版本号', type: 'input', maxlength: 10},
          {key: 'nouseTimeRange', key1: 'productionTime', key2: 'distributionTime', label: '日期选择', label1: '生产日期', label2: '配发日期', type: 'dateRangePicker', required: 3, requiredInfo: '生产日期和配送日期不能为空', dateType: 'date', format: 'yyyy-MM-dd', valueFormat: 'yyyy-MM-dd', class: 'auto-width'},
          // {key: 'deptId', label: '配发单位', type: 'select', filterable: true, getOptions: '/organization/department/queryAll', itemKey: 'deptId', itemLabel: 'deptName'},
          {key: 'parentDeptIds', label: '配发单位', saveKey: 'deptId', type: 'casc', class: 'auto-width', getOptions: '/organization/department/queryDepartmentTree', props: {value: 'id', label: 'text', children: 'children'}, options: [], change: this.changeDept},
          {key: 'empId', label: '责任人', type: 'select', filterable: true, itemKey: 'empId', getOptions: '/organization/employee/queryAllForHandHeldTerminal', itemLabel: 'empName'},
          {key: 'phoneNumber', label: '手机号', type: 'input'},
          {key: 'simSerialNumber', label: 'SIM卡序列号', type: 'input', maxlength: 20},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          deviceNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: maxENReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          deviceModel: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          deviceType: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          versionNumber: [
            {validator: maxENReg, trigger: 'blur'}
          ],
          phoneNumber: [
            {validator: phoneReg, trigger: 'blur'}
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
          // 'p': '设备类型',
          key: 'deviceType',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'code',
          optLabel: 'name',
          inputText: '设备类型',
          getOptions: '/basicdata/classifyCode/queryName/DeviceType',
          span: 4
        }, {
          // 'p': '配发单位',
          key: 'deptId',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'deptId',
          optLabel: 'deptName',
          inputText: '配发单位',
          getOptions: '/organization/department/queryAll',
          span: 4
        }, {
          // 'p': '责任人',
          key: 'empId',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'empId',
          optLabel: 'empName',
          inputText: '责任人',
          getOptions: '/organization/employee/queryAllByEmpId',
          span: 4
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
        key: 'deviceNo',
        multipleSelection: [],
        fields: [
          {prop: 'deviceNo', label: '设备编号', fixed: true, hidden: false},
          {prop: 'deviceModel', label: '设备型号', fixed: false, hidden: false},
          {prop: 'deviceType', label: '设备类型', fixed: false, hidden: false, optionKey: 'deviceType'},
          {prop: 'productionTime', label: '生产日期', fixed: false, hidden: false},
          {prop: 'distributionTime', label: '配发日期', fixed: false, hidden: false},
          {prop: 'versionNumber', label: '版本号', fixed: false, hidden: false},
          {prop: 'deptName', label: '配发单位', fixed: false, hidden: false},
          {prop: 'empName', label: '责任人', fixed: false, hidden: false},
          {prop: 'phoneNumber', label: '手机号', fixed: false, hidden: false},
          {prop: 'simSerialNumber', label: 'SIM卡序列号', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['empId'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'optionsQuery', {'deptId': row.deptId})
          this.$set(this.formData.formData[i], 'getOptions', '/organization/employee/queryAllForHandHeldTerminal')
        }
        if (this.formData.formData[i].type == 'dateRangePicker') {
          this.$set(this.formData.formData[i], 'value', {start: null, end: null})
          this.formData.formData[i].value.start = row[this.formData.formData[i].key1]
          this.formData.formData[i].value.end = row[this.formData.formData[i].key2]
        } else {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['empId'].includes(this.formData.formData[i].key)) {
          this.$set(this.formData.formData[i], 'optionsQuery', {'deptId': row.deptId})
          this.$set(this.formData.formData[i], 'getOptions', '/organization/employee/queryAllForHandHeldTerminal')
        }
        if (this.formData.formData[i].type == 'dateRangePicker') {
          this.$set(this.formData.formData[i], 'value', {start: null, end: null})
          this.formData.formData[i].value.start = row[this.formData.formData[i].key1]
          this.formData.formData[i].value.end = row[this.formData.formData[i].key2]
        } else {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['empId'].includes(this.formData.formData[i].key)) {
          this.$delete(this.formData.formData[i], 'optionsQuery')
          this.$delete(this.formData.formData[i], 'getOptions')
          this.$delete(this.formData.formData[i], 'options')
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    changeDept (value, callback) {
      var data = {
        deptId: ''
      }
      if (!_.isEmpty(value)) {
        data.deptId = _.last(value)
        queryAll('/organization/employee/queryAllForHandHeldTerminal', data).then(response => {
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
      } else {
        let emp = {
          key: 'empId',
          value: null
        }
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'empId') {
            this.$set(this.formData.formData[i], 'options', [])
            callback(emp)
            return null
          }
        }
      }
    }
  }
}
</script>
