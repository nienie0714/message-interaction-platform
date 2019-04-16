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
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload" @handleAdd="handleAdd" @handleDelete="handleMultKeyDelete"></Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" @change="tableChange" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleMultKeyDelete"></Table-view>
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
import {threeD} from '../../../util/rules.js'
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
      baseUrl: 'basicdata/vehicleDeviceRelation',
      deleteUrl: 'basicdata/vehicleDeviceRelation/deleteVehicleDevice',
      // 查询条件每行个数
      colSize: 4,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        groupKeyUrl: 'basicdata/vehicleDeviceRelation/queryAll',
        clearRulesKey: ['deviceNo'],
        formData: [
          {key: 'vehicleDeviceId', label: '车辆设备编号', type: 'pInput', isHidden: true},
          {key: 'vehicleId', label: '车牌号', type: 'select', filterable: true, clearable: true, getOptions: '/basicdata/vehicleDeviceRelation/queryVehicleWithoutBindDevice', itemKey: 'vehicleId', itemLabel: 'vehicleNo', change: this.changeNo},
          {key: 'deviceNo', label: '设备编号', type: 'input', disabled: true, maxlength: 20, change: this.changeGroupKey},
          {key: 'vTypeName', label: '车型名称', type: 'pInput'},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          vehicleId: [
            {required: true, message: '必填项', trigger: 'change'},
            {validator: this.uniqueEdit, trigger: 'change'}
          ],
          deviceNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          vTypeName: [
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
          key: 'vTypeNo',
          value: '',
          type: 'select',
          inputText: '车型名称',
          getOptions: '/basicdata/vehicleType/queryAll',
          span: 4,
          optKey: 'vTypeNo',
          optLabel: 'vTypeName',
          filterable: true
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
        key: 'vehicleDeviceId',
        multipleSelection: [],
        fields: [
          {prop: 'deviceNo', label: '设备编号', fixed: true, hidden: false},
          {prop: 'vehicleNo', label: '车牌号', fixed: false, hidden: false},
          {prop: 'vTypeName', label: '车型名称', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (['vehicleId'].includes(this.formData.formData[i].key)) {
            this.$set(this.formData.formData[i], 'optionsQuery', {'vehicleId': data.currentRow.vehicleId})
          }
        }
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['vehicleId'].includes(this.formData.formData[i].key)) {
          this.$delete(this.formData.formData[i], 'optionsQuery')
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    changeNo (value, callback) {
      queryAll('/basicdata/vehicle/queryVehicleTypeByVehicleId', {'vehicleId': value}).then(response => {
        let vTypeName = {
          key: 'vTypeName',
          value: null
        }
        if (response.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].key == 'vTypeName') {
              vTypeName.value = response.data.data[0]['vTypeName']
              callback(vTypeName)
              return
            }
          }
        } else {
          callback(vTypeName)
          return null
        }
      })
    },
    changeGroupKey (value, callback) {
      if (!value.trim()) {
        this.$refs.basicTable.$parent.$parent.$children[2].$refs['ruleForm'].validateField('vehicleId')
        // this.$refs['ruleForm'].validateField('vehicleId')
      }
      callback()
    }
  }
}
</script>
