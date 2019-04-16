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
import {threeD, twoDecimal} from '../../../util/rules.js'

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
      baseUrl: 'basicdata/VehicleMaintenanceRecord',
      // 查询条件每行个数
      colSize: 4,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'maintenanceId',
        clearRulesKey: ['vehicleId', 'maintenanceType'],
        formData: [
          {key: 'maintenanceId', label: '排序码', type: 'input', isHidden: true},
          {key: 'vehicleId', label: '车牌号', type: 'select', filterable: true, getOptions: '/basicdata/vehicle/queryAll', itemKey: 'vehicleId', itemLabel: 'vehicleNo', autosize: true},
          {key: 'maintenanceType', label: '维护类型', type: 'tabs', tabsKey: 'vmaintType', change: this.changeType},
          {key: 'nouseTimeRange', key1: 'beginTime', key2: 'endTime', label: '车辆维护时间区间', label1: '开始/加油时间', label2: '结束时间', type: 'dateRangePicker', required: 1, requiredInfo: '开始/加油时间', dateType: 'datetime', format: 'yyyy-MM-dd HH:mm', valueFormat: 'yyyy-MM-dd HH:mm', class: 'auto-width'},
          {key: 'sender', label: '送修人/加油人', type: 'select', filterable: true, getOptions: '/organization/employee/queryAllByEmpId', itemKey: 'empId', itemLabel: 'empName', autosize: true},
          {key: 'receiver', label: '接收人', type: 'select', filterable: true, getOptions: '/organization/employee/queryAllByEmpId', itemKey: 'empId', itemLabel: 'empName', autosize: true},
          {key: 'maintainer', label: '维修人', type: 'select', filterable: true, getOptions: '/organization/employee/queryAllByEmpId', itemKey: 'empId', itemLabel: 'empName', autosize: true},
          {key: 'fuelAmount', label: '加油量(L)', type: 'input', maxlength: 10},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          vehicleId: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          maintenanceType: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          nouseTimeRange: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          sender: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          fuelAmount: [
            {validator: twoDecimal, trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          // p: '车牌号',
          key: 'vehicleNo',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '车牌号',
          getOptions: '/basicdata/VehicleMaintenanceRecord/getVehicleNo',
          span: 3
        }, {
          // 'p': '维护类型',
          key: 'maintenanceType',
          tabsKey: 'vmaintType',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '维护类型',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 4
        }, {
          key: 'searchName',
          value: '',
          type: 'input',
          inputText: '送/维/接人',
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
        key: 'maintenanceId',
        multipleSelection: [],
        fields: [
          {prop: 'vehicleNo', label: '车牌号', fixed: true, hidden: false},
          {prop: 'maintenanceType', label: '维护类型', fixed: false, hidden: false, optionKey: 'vmaintType'},
          {prop: 'beginTime', label: '开始/加油时间', fixed: false, hidden: false},
          {prop: 'endTime', label: '结束时间', fixed: false, hidden: false},
          {prop: 'senderName', label: '送修人/加油人', fixed: false, hidden: false},
          {prop: 'maintainerName', label: '维修人', fixed: false, hidden: false},
          {prop: 'receiverName', label: '接收人', fixed: false, hidden: false},
          {prop: 'fuelAmount', label: '加油量(L)', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$store.commit('setOption', 'vmaintType')
        var temp = this.$store.getters.getOption
        if (temp[0] == 'VEHICLE.MAINTAIN.TYPE.R') {
          if (this.formData.formData[i].key == 'maintainer') {
            this.$set(this.formData.formData[i], 'hidden', true)
          }
          if (this.formData.formData[i].key == 'fuelAmount') {
            this.$delete(this.formData.formData[i], 'hidden')
          }
        } else {
          if (this.formData.formData[i].key == 'fuelAmount') {
            this.$set(this.formData.formData[i], 'hidden', true)
          }
          if (this.formData.formData[i].key == 'maintainer') {
            this.$delete(this.formData.formData[i], 'hidden')
          }
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (data.currentRow.maintenanceType == 'VEHICLE.MAINTAIN.TYPE.R') {
            if (this.formData.formData[i].key == 'maintainer') {
              this.$set(this.formData.formData[i], 'hidden', true)
            }
            if (this.formData.formData[i].key == 'fuelAmount') {
              this.$delete(this.formData.formData[i], 'hidden')
            }
          } else {
            if (this.formData.formData[i].key == 'fuelAmount') {
              this.$set(this.formData.formData[i], 'hidden', true)
            }
            if (this.formData.formData[i].key == 'maintainer') {
              this.$delete(this.formData.formData[i], 'hidden')
            }
          }
          if (this.formData.formData[i].type == 'dateRangePicker') {
            this.$set(this.formData.formData[i], 'value', {start: null, end: null})
            this.formData.formData[i].value.start = data.currentRow[this.formData.formData[i].key1]
            this.formData.formData[i].value.end = data.currentRow[this.formData.formData[i].key2]
          } else {
            this.$set(this.formData.formData[i], 'value', data.currentRow[this.formData.formData[i].key])
          }
        }
      }
    },
    changeType (value, callback) {
      var param = {
        key: 'maintenanceType',
        value: value
      }
      var count = 0
      if (value == 'VEHICLE.MAINTAIN.TYPE.R') {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'maintainer') {
            this.$set(this.formData.formData[i], 'hidden', true)
            count += 1
          }
          if (this.formData.formData[i].key == 'fuelAmount') {
            this.$delete(this.formData.formData[i], 'hidden')
            count += 1
          }
          if (count >= 2) {
            callback()
            return null
          }
        }
      } else {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'maintainer') {
            this.$delete(this.formData.formData[i], 'hidden')
            count += 1
          }
          if (this.formData.formData[i].key == 'fuelAmount') {
            this.$set(this.formData.formData[i], 'hidden', true)
            count += 1
          }
          if (count >= 2) {
            callback()
            return null
          }
        }
      }
      callback()
      return null
    }
  }
}
</script>
