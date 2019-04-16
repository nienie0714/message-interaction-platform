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
import {idReg, idNumReg, threeD} from '../../../util/rules.js'
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
      baseUrl: 'airportResource/terminalResource',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        /* key: 'resourceId', */
        groupKey: ['resourceNo', 'resourceType', 'terminalNo'],
        groupKeyUrl: 'airportResource/terminalResource/queryAll',
        formData: [
          {key: 'resourceId', label: '资源ID', type: 'input', isHidden: true},
          {key: 'resourceNo', label: '资源编号', type: 'input', toUpper: true, maxlength: 20},
          {key: 'terminalNo', label: '航站楼', type: 'select', filterable: true, getOptions: '/airportResource/terminal/queryAll', itemKey: 'terminalNo', itemLabel: 'name'},
          {key: 'resourceType', label: '资源类型', type: 'tabs', class: 'auto-width', tabsKey: 'temResourceType'},
          {key: 'attr', label: '属性', type: 'tabs', tabsKey: 'attr'},
          {key: 'terminalAreaNo', label: '航站楼区域', type: 'select', getOptions: '/airportResource/terminalArea/queryAll', itemKey: 'terminalAreaNo', itemLabel: 'name'},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'isUseable', label: '是否可用', type: 'tabs', tabsKey: 'isYOrN'},
          {key: 'remark', label: '备注', type: 'textarea', class: 'auto-width', autosize: true, maxlength: 100}
        ],
        rules: {
          /* resourceId: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idNumReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ], */
          resourceNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idReg, trigger: 'blur'}
          ],
          resourceType: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          terminalNo: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          attr: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          isUseable: [
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
          // 'p': '资源编号',
          key: 'resourceNo',
          value: '',
          type: 'input',
          inputText: '资源编号',
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
        key: 'resourceId',
        multipleSelection: [],
        fields: [
          {prop: 'resourceNo', label: '资源编号', fixed: false, hidden: false},
          {prop: 'resourceType', label: '资源类型', fixed: false, hidden: false, optionKey: 'temResourceType'},
          {prop: 'attr', label: '属性', fixed: false, hidden: false, optionKey: 'attr'},
          {prop: 'terminalName', label: '航站楼', fixed: false, hidden: false},
          {prop: 'terminalAreaName', label: '航站楼区域', fixed: false, hidden: false},
          {prop: 'isUseable', label: '是否可用', fixed: false, hidden: false, optionKey: 'isYOrN'}
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
