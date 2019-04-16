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
import basicMsgBoxMixin from '../../../components/mixin/basicMsgBoxMixin'
import pageTableMixin from '../../../components/mixin/pageTableMixin'
import {idReg, threeD, phoneReg, intNum} from '../../../util/rules.js'
import { queryAll, dfsPost } from '../../../api/base.js'

export default {
  components: {
    QueryView,
    PaginationView,
    TableView,
    ToolButtonView,
    EditView
  },
  mixins: [basicTableMixin, basicMsgBoxMixin, pageTableMixin],
  data () {
    return {
      file: '',
      uploadUrl: 'dfs/files',
      // 基础路径
      baseUrl: 'knowledge/knowledgearticle',
      // 查询条件每行个数
      colSize: 1,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'kaguid', label: '文件编号', type: 'input', maxlength: 50, isHidden: true},
          {key: 'name', label: '文件名称', type: 'input', maxlength: 100},
          {key: 'keywords', label: '关键字', type: 'input'},
          {key: 'pids', label: '所属目录', type: 'casc', class: 'auto-width', saveKey: 'pid', getOptions: '/knowledge/knowledgeTree/queryTree', props: {value: 'id', label: 'text', children: 'children'}},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'path', label: '上传文件', type: 'uploadFile', action: 'dfs/files', showFile: true, required: true}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ],
          pids: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          path: [
            {required: true, message: '必填项', trigger: 'change'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          key: 'name',
          value: '',
          type: 'input',
          inputText: '文件名称/关键字',
          span: 4
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
        key: 'kaguid',
        multipleSelection: [],
        fields: [
          {prop: 'name', label: '文件名称', fixed: false, hidden: false},
          {prop: 'keywords', label: '关键字', fixed: false, hidden: false},
          {prop: 'pidName', label: '所属目录', fixed: false, hidden: false},
          {prop: 'path', label: '下载文件', type: 'file', fixed: false, hidden: false, name: 'name'}
        ]
      }
    }
  },
  methods: {
  }
}
</script>
