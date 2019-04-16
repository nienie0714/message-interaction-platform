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
import {idReg, sevDotTwoDigit, sixDotSixDigit, threeD, degreePos} from '../../../util/rules.js'
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
      baseUrl: 'airportResource/aircraftStand',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'standNo',
        formData: [
          {key: 'standNo', label: '机位编号', type: 'input', toUpper: true, change: this.changeNo, maxlength: 20},
          {key: 'attr', label: '属性', type: 'tabs', tabsKey: 'attr'},
          {key: 'rank', label: '机位等级', type: 'tabs', tabsKey: 'rank'},
          {key: 'terminalNo', label: '航站楼', type: 'select', filterable: true, getOptions: '/airportResource/terminal/queryAll', itemKey: 'terminalNo', itemLabel: 'name'},
          {key: 'apronAreaNo', label: '机坪区域', type: 'select', filterable: true, getOptions: '/airportResource/apronArea/queryAll', itemKey: 'apronAreaNo', itemLabel: 'name'},
          {key: 'standParent', label: '父机位', type: 'select', filterable: true, getOptions: '/airportResource/aircraftStand/queryAllForLeftRightStand', itemKey: 'standNo', itemLabel: 'standNo'},
          {key: 'standType', label: '机位类型', type: 'tabs', tabsKey: 'standType', class: 'auto-width'},
          {key: 'isBridge', label: '是否廊桥', type: 'tabs', tabsKey: 'isYOrN'},
          {key: 'isPipeRefuel', label: '是否管道加油', type: 'tabs', tabsKey: 'isYOrN'},
          {key: 'length', label: '长度/米', type: 'input'},
          {key: 'width', label: '宽度/米', type: 'input'},
          {key: 'standLeft', label: '左机位', type: 'select', filterable: true, getOptions: '/airportResource/aircraftStand/queryAllForLeftRightStand', itemKey: 'standNo', itemLabel: 'standNo'},
          {key: 'standRight', label: '右机位', type: 'select', filterable: true, getOptions: '/airportResource/aircraftStand/queryAllForLeftRightStand', itemKey: 'standNo', itemLabel: 'standNo'},
          {key: 'coordinateX', label: 'X坐标', type: 'input'},
          {key: 'coordinateY', label: 'Y坐标', type: 'input'},
          {key: 'standGates', label: '对应登机口', type: 'select', filterable: true, multiple: true, saveKey: 'standGate', getOptions: '/airportResource/gate/queryAll', itemKey: 'gateNo', itemLabel: 'gateNo'},
          {key: 'isDoubleBridge', label: '是否双廊桥', type: 'tabs', tabsKey: 'isYOrN'}, /* key: 'nouseTimeRange' */
          {key: 'nouseTimeRange', key1: 'nouseSTime', key2: 'nouseETime', label: '机位停用时间区间', label1: '停用开始时间', label2: '停用结束时间', type: 'dateRangePicker', dateType: 'datetime', format: 'yyyy-MM-dd HH:mm', valueFormat: 'yyyy-MM-dd HH:mm', class: 'auto-width'},
          {key: 'isUseable', label: '是否可用', type: 'tabs', tabsKey: 'isYOrN'},
          /* {key: 'nouseSTime', label: '机位开始时间', type: 'input'},
          {key: 'nouseETime', label: '机位结束时间', type: 'input'}, */
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'azimuth', label: '方向角/度', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          standNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          terminalNo: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          rank: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          attr: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          standType: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          isBridge: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          isPipeRefuel: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          length: [
            {validator: sevDotTwoDigit, trigger: 'blur'}
          ],
          width: [
            {validator: sevDotTwoDigit, trigger: 'blur'}
          ],
          coordinateX: [
            {validator: sixDotSixDigit, trigger: 'blur'}
          ],
          coordinateY: [
            {validator: sixDotSixDigit, trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ],
          azimuth: [
            {validator: degreePos, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '机位编号',
          key: 'standNo',
          value: '',
          type: 'input',
          inputText: '机位编号',
          toUpper: true,
          span: 3
        }, {
          // 'p': '属性',
          key: 'attr',
          tabsKey: 'attr',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 5
        }, {
          p: '是否可用',
          key: 'isUseable',
          tabsKey: 'isYOrN',
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
          p: '是否廊桥',
          key: 'isBridge',
          tabsKey: 'isYOrN',
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
        type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'standNo',
        multipleSelection: [],
        fields: [
          {prop: 'standNo', label: '机位编号', fixed: true, hidden: false},
          {prop: 'attr', label: '属性', fixed: false, hidden: false, optionKey: 'attr'},
          {prop: 'rank', label: '机位等级', fixed: false, hidden: false},
          {prop: 'terminalName', label: '航站楼', fixed: false, hidden: false},
          {prop: 'apronAreaName', label: '机坪区域', fixed: false, hidden: false},
          {prop: 'standType', label: '机位类型', fixed: false, hidden: false, optionKey: 'standType'},
          {prop: 'standParent', label: '父机位', fixed: false, hidden: false},
          {prop: 'isBridge', label: '是否廊桥', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'isPipeRefuel', label: '是否管道加油', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'isUseable', label: '是否可用', fixed: false, hidden: false, optionKey: 'isYOrN'}
          /* {prop: 'length', label: '长度', fixed: false, hidden: false},
          {prop: 'width', label: '宽度', fixed: false, hidden: false},
          {prop: 'standLeft', label: '左机位', fixed: false, hidden: false},
          {prop: 'standRight', label: '右机位', fixed: false, hidden: false},
          {prop: 'standGate', label: '对应登机口', fixed: false, hidden: false} */
        ]
      }
    }
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (['standLeft', 'standRight', 'standParent'].includes(this.formData.formData[i].key)) {
            this.$set(this.formData.formData[i], 'optionsQuery', {'standNo': data.currentRow.standNo})
          }
        }
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (['standLeft', 'standRight'].includes(this.formData.formData[i].key)) {
          let data = {}
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    changeNo (value, callback) {
      if (value) {
        value = value.trim()
      }
      queryAll('/airportResource/aircraftStand/getStandList', {'standNo': value}).then(response => {
        let standParent = {
          key: 'standParent',
          value: null
        }
        if (response.data.code == 0) {
          queryAll('/airportResource/aircraftStand/queryAllForLeftRightStand', {'standNo': value}).then(res => {
            if (res.data.code == 0) {
              for (let i = 0; i < this.formData.formData.length; i++) {
                if (this.formData.formData[i].key == 'standParent') {
                  this.$set(this.formData.formData[i], 'options', response.data.data)
                } else if (['standLeft', 'standRight'].includes(this.formData.formData[i].key)) {
                  this.$set(this.formData.formData[i], 'options', res.data.data)
                }
              }
              callback(standParent)
              return null
            }
          })
        } else {
          callback(standParent)
          return null
        }
      })
    }
  }
}
</script>

<style scope>
</style>
