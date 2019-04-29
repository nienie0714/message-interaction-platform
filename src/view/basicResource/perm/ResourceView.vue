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
import {idReg, idNumReg, resourceReg, urlValidator} from '../../../util/rules.js'

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
      baseUrl: 'manage/sysResource',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'resourceNo',
        formData: [
          {key: 'resourceNo', label: '资源No', type: 'input', isHidden: true},
          {key: 'name', label: '资源名称', type: 'input', maxlength: 25},
          {key: 'url', label: '资源连接地址', type: 'input', maxlength: 50},
          {key: 'icon', label: '资源图标', type: 'input', maxlength: 30},
          {key: 'resourceType', label: '资源类型', type: 'tabs', tabsKey: 'resourceType'},
          {key: 'status', label: '是否启用', type: 'tabs', tabsKey: 'isYOrN'},
          {key: 'parentIds', label: '父级资源', type: 'casc', class: 'auto-width', saveKey: 'pno', getOptions: '/manage/sysResource/allTree', props: {value: 'id', label: 'text', children: 'children'}}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: resourceReg, trigger: 'blur'}
          ],
          url: [
            {validator: urlValidator, trigger: 'blur'}
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
        key: 'resourceNo',
        multipleSelection: [],
        fields: [
          {prop: 'resourceNo', label: '资源No', fixed: true, hidden: true},
          {prop: 'name', label: '资源名称', fixed: false, hidden: false},
          {prop: 'url', label: '资源连接地址', fixed: false, hidden: false},
          {prop: 'icon', label: '资源图标', fixed: false, hidden: false},
          {prop: 'resourceType', label: '资源类型', fixed: false, hidden: false, optionKey: 'resourceType'},
          {prop: 'status', label: '是否启用', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'pnoCn', label: '父级资源', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    customSaveBefore (data) {
      var obj = {}
      // if (this.formData.title == '编辑') {
        obj = JSON.parse(JSON.stringify(data))
        let pno = obj.parentIds[obj.parentIds.length - 1]
        this.$set(obj, 'pno', pno)
      // }
      return obj
    }
  }
}
</script>
