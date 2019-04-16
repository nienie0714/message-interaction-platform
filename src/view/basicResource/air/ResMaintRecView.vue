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
import {idReg, sevDotTwoDigit, sixDotSixDigit, degreePos} from '../../../util/rules.js'
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
      baseUrl: 'airportResource/resourceMaintenanceRecord',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'maintenanceId',
        formData: [
          {key: 'maintenanceId', label: '资源维护ID', type: 'input', isHidden: true},
          {key: 'resourceNo', label: '资源编号', type: 'select', filterable: true, getOptions: '/airportResource/terminalResource/queryAll', valueKey: 'resourceId', itemKey: 'resourceNo', itemLabel: 'resourceNo', disabled: true, change: this.changeNo},
          {key: 'resourceType', label: '资源类型', type: 'tabs', tabsKey: 'temResourceType', class: 'auto-width', disabled: true, change: this.changeType},
          {key: 'timeRange', key1: 'startTime', key2: 'endTime', label: '维护时间区间', label1: '开始时间', label2: '结束时间', type: 'dateRangePicker', required: 3, dateType: 'datetime', format: 'yyyy-MM-dd HH:mm:ss', valueFormat: 'yyyy-MM-dd HH:mm:ss', class: 'auto-width'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          /* maintenanceId: [
            {required: true, message: '必填项', trigger: 'blur'}/* ,
            {validator: idReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ], */
          resourceNo: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          resourceType: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '资源编号',
          key: 'resourceNo',
          value: '',
          type: 'select',
          filterable: true,
          // optKey: 'resourceNo',
          // optLabel: 'resourceNo',
          inputText: '资源编号',
          getOptions: '/airportResource/terminalResource/queryAllWithoutRepeat',
          span: 4
        }, {
          // 'p': '资源类型',
          key: 'resourceType',
          tabsKey: 'temResourceType',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 6
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
        key: 'maintenanceId',
        multipleSelection: [],
        fields: [
          {prop: 'resourceType', label: '资源类型', fixed: false, hidden: false, optionKey: 'temResourceType'},
          {prop: 'resourceNo', label: '资源编号', fixed: false, hidden: false},
          {prop: 'startTime', label: '开始时间', fixed: false, hidden: false},
          {prop: 'endTime', label: '结束时间', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'resourceType') {
            this.$set(this.formData.formData[i], 'optionsQuery', {'resourceType': data.currentRow.resourceType})
          }
        }
      }
    },
    changeNo (obj, callback) {
      let resourceType = {
        key: 'resourceType',
        value: null
      }
      if (obj) {
        resourceType.value = obj.resourceType
      }
      callback(resourceType)
    },
    changeType (value, callback) {
      if (value) {
        value = value.trim()
      }
      queryAll('/airportResource/terminalResource/queryAll', {'resourceType': value}).then(response => {
        let resourceNo = {
          key: 'resourceNo',
          value: null
        }
        if (response.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].key == 'resourceNo') {
              this.$set(this.formData.formData[i], 'options', response.data.data)
              if (response.data.data.length > 0) {
                resourceNo.value = response.data.data[0].resourceNo
              }
              callback(resourceNo)
              return
            }
          }
        } else {
          callback(resourceNo)
          return null
        }
      })
    }
  }
}
</script>

<style scope>
</style>
