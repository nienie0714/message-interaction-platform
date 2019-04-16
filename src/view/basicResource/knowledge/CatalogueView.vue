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
import basicMsgBoxMixin from '../../../components/mixin/basicMsgBoxMixin'
import pageTableMixin from '../../../components/mixin/pageTableMixin'
import {idReg, threeD, phoneReg, intNum} from '../../../util/rules.js'
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
      // 基础路径
      baseUrl: 'knowledge/knowledgeTree',
      // 查询条件每行个数
      colSize: 1,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'ktguid', label: '目录编号', type: 'input', maxlength: 50, isHidden: true},
          {key: 'name', label: '目录名称', type: 'input', maxlength: 100},
          {key: 'pids', label: '父级目录', saveKey: 'pid', type: 'casc', class: 'auto-width', getOptions: '/knowledge/knowledgeTree/queryTree', props: {value: 'id', label: 'text', children: 'children'}},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          pids: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          key: 'name',
          value: '',
          type: 'input',
          inputText: '父级目录',
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
        key: 'ktguid',
        multipleSelection: [],
        fields: [
          {prop: 'name', label: '目录名称', fixed: false, hidden: false},
          {prop: 'pidName', label: '父级目录', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].key == 'pids') {
          let data = {}
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          this.$set(this.formData.formData[i], 'value', data.currentRow[this.formData.formData[i].key])
          if (this.formData.formData[i].key == 'pids') {
            let obj = {
              'ktguid': data.currentRow['ktguid']
            }
            this.$set(this.formData.formData[i], 'optionsQuery', obj)
          }
        }
      }
    }
  }
}
</script>
