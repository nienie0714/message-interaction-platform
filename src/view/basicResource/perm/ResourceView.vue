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
import {idReg, idNumReg} from '../../../util/rules.js'

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
      baseUrl: 'sys/resource',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'resourceId', label: '资源名称', type: 'input', isHidden: true},
          {key: 'name', label: '资源名称', type: 'input', maxlength: 20},
          {key: 'resourceType', label: '资源类型', type: 'tabs', tabsKey: 'resourceType'},
          {key: 'url', label: '资源连接地址', type: 'input', maxlength: 200},
          {key: 'icon', label: '资源图标', type: 'input', maxlength: 30},
          {key: 'status', label: '是否启用', type: 'tabs', tabsKey: 'isYOrN'},
          {key: 'sortkey', label: '排序码', type: 'input', maxlength: 3},
          {key: 'parentIds', label: '父级资源', type: 'casc', class: 'auto-width', saveKey: 'pid', getOptions: '/sys/resource/queryAllTree', props: {value: 'id', label: 'text', children: 'children'}}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          sortkey: [
            {validator: idNumReg, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [{
        // p: '资源名称',
        key: 'name',
        value: '',
        type: 'input',
        inputText: '资源名称',
        span: 4
      }, {
          // 'p': '资源类型',
          key: 'resourceType',
          tabsKey: 'resourceType',
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
        }],
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
          {prop: 'name', label: '资源名称', fixed: true, hidden: false},
          {prop: 'url', label: '资源连接地址', fixed: false, hidden: false},
          {prop: 'icon', label: '资源图标', fixed: false, hidden: false},
          {prop: 'resourceType', label: '资源类型', fixed: false, hidden: false, optionKey: 'resourceType'},
          {prop: 'status', label: '是否启用', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'parentName', label: '父级资源', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
  }
}
</script>
