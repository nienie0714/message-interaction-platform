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
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleMultKeyDelete"></Table-view>
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
import {idReg, threeD} from '../../../util/rules.js'
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
      baseUrl: 'basicdata/classifyCode',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        groupKey: ['code', 'classify'],
        groupKeyUrl: 'basicdata/classifyCode/queryAll',
        formData: [
          {key: 'code', label: '代码', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'classify', label: '类别', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'name', label: '名称', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', class: 'auto-height auto-width', autosize: true, maxlength: 100}
        ],
        rules: {
          code: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          classify: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          name: [
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
      queryList: [{
        // p: '类别',
        key: 'classify',
        value: '',
        type: 'select',
        filterable: true,
        inputText: '类别',
        getOptions: '/basicdata/classifyCode/queryAllClassify',
        span: 4
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
        multipleSelection: [],
        fields: [
          {prop: 'code', label: '代码', fixed: true, hidden: false},
          {prop: 'classify', label: '类别', fixed: false, hidden: false},
          {prop: 'name', label: '名称', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'classify') {
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
