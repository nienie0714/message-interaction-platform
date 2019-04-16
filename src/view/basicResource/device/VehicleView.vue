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
      baseUrl: 'basicdata/vehicle',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'vehicleId',
        formData: [
          {key: 'vehicleId', label: '车牌编号', type: 'pInput', maxlength: 10, isHidden: true},
          {key: 'vehicleNo', label: '车牌号', type: 'input', maxlength: 10},
          {key: 'vTypeNo', label: '车辆类型', type: 'select', filterable: true, getOptions: '/basicdata/vehicleType/queryAll', itemKey: 'vTypeNo', itemLabel: 'vTypeName'},
          {key: 'vehicleModel', label: '车辆型号', type: 'input', maxlength: 20},
          {key: 'manufacturer', label: '厂商', type: 'input', maxlength: 30},
          {key: 'vehicleColor', label: '颜色', type: 'input', maxlength: 30},
          {key: 'fuelType', label: '燃料类型', type: 'tabs', tabsKey: 'fuelType'},
          {key: 'useTime', label: '投运日期', type: 'date', format: 'yyyy-MM-dd', valueFormat: 'yyyy-MM-dd'},
          {key: 'reviewTime', label: '年审日期', type: 'date', format: 'yyyy-MM-dd', valueFormat: 'yyyy-MM-dd'},
          {key: 'status', label: '管理状态', type: 'tabs', tabsKey: 'vehicleStatus'},
          {key: 'permissionArea', label: '使用区域', type: 'tabs', tabsKey: 'vehicleArea'},
          {key: 'airportIata', label: '所属机场', type: 'tabs', tabsKey: 'airport'},
          {key: 'deptIds', label: '所属单位', saveKey: 'deptId', type: 'casc', class: 'auto-width', getOptions: '/organization/department/queryDeptTreeByUserId', props: {value: 'id', label: 'text', children: 'children'}, options: []},
          {key: 'vehicleMileage', label: '行驶里程(KM)', type: 'input', maxlength: 6},
          {key: 'fuelAmount', label: '加油量(L)', type: 'pInput'},
          {key: 'empId', label: '车辆负责人', type: 'select', filterable: true, getOptions: '/organization/employee/queryUnboundEmp', itemKey: 'empId', itemLabel: 'empName', itemLabelSpan: 'deptName'},
          {key: 'phoneNumber', label: '手机号', type: 'input'},
          {key: 'simSerialNumber', label: 'SIM卡序列号', type: 'input', maxlength: 30},
          {key: 'licenseType', label: '驾驶资质', type: 'input', maxlength: 10},
          {key: 'assetNumber', label: '资产编号', type: 'input', maxlength: 50},
          {key: 'isOnline', label: '是否在线', type: 'tabs', tabsKey: 'isYOrN', defaultValue: 'N', isDisabled: true},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          vehicleNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: this.uniqueEdit, trigger: 'blur'}
          ],
          vTypeNo: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          vehicleModel: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          manufacturer: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          vehicleColor: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          fuelType: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          useTime: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          reviewTime: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          status: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          permissionArea: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          airportIata: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          deptIds: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          vehicleMileage: [
            {validator: twoDecimal, trigger: 'blur'}
          ],
          phoneNumber: [
            {validator: phoneReg, trigger: 'blur'}
          ],
          simSerialNumber: [
            {validator: maxENReg, trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '车牌号',
          key: 'vehicleId',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '车牌号',
          getOptions: '/basicdata/vehicle/queryAll',
          optKey: 'vehicleId',
          optLabel: 'vehicleNo',
          span: 3
        }, {
          // 'p': '车辆类型',
          key: 'vTypeNo',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'vTypeNo',
          optLabel: 'vTypeName',
          inputText: '车辆类型',
          getOptions: '/basicdata/vehicleType/queryAll',
          span: 3
        }, {
          // 'p': '管理状态',
          key: 'status',
          tabsKey: 'vehicleStatus',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 4
        }, {
          // 'p': '所属单位',
          key: 'deptId',
          value: null,
          type: 'select',
          filterable: true,
          optKey: 'deptId',
          optLabel: 'deptName',
          inputText: '所属单位',
          getOptions: '/organization/department/queryAll',
          span: 4
        }, {
          // 'p': '使用区域',
          key: 'permissionArea',
          tabsKey: 'vehicleArea',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 4
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
        key: 'vehicleId',
        multipleSelection: [],
        fields: [
          {prop: 'vehicleNo', label: '车牌号', fixed: true, hidden: false},
          {prop: 'vTypeName', label: '车辆类型', fixed: false, hidden: false},
          {prop: 'vehicleModel', label: '车辆型号', fixed: false, hidden: false},
          /* {prop: 'manufacturer', label: '厂商', fixed: false, hidden: false},
          {prop: 'vehicleColor', label: '颜色', fixed: false, hidden: false},
          {prop: 'fuelType', label: '燃料类型', fixed: false, hidden: false, optionKey: 'fuelType'}, */
          {prop: 'useTime', label: '投运日期', fixed: false, hidden: false},
          {prop: 'reviewTime', label: '年审日期', fixed: false, hidden: false},
          {prop: 'deptName', label: '所属单位', fixed: false, hidden: false},
          {prop: 'permissionArea', label: '使用区域', fixed: false, hidden: false, optionKey: 'vehicleArea'},
          {prop: 'licenseType', label: '驾驶资质', fixed: false, hidden: false},
          {prop: 'status', label: '管理状态', fixed: false, hidden: false, optionKey: 'vehicleStatus'},
          /* {prop: 'airportIata', label: '所属机场', fixed: false, hidden: false, optionKey: 'airport'}, */
          {prop: 'vehicleMileage', label: '行驶里程(KM)', fixed: false, hidden: false},
          {prop: 'fuelAmount', label: '加油量(L)', fixed: false, hidden: false},
          /* {prop: 'assetNumber', label: '资产编号', fixed: false, hidden: false}, */
          {prop: 'isOnline', label: '是否在线', fixed: false, hidden: false, optionKey: 'isYOrN'}
        ]
      }
    }
  },
  methods: {
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'vehicleId') {
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
