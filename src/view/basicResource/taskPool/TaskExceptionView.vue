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
import {rdEReg, rthEReg, threeD} from '../../../util/rules.js'
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
      baseUrl: 'taskbasic/taskExceptions',
      // 新增路径
      addUrl: 'taskbasic/taskExceptions/batchSave',
      // 编辑路径
      editUrl: 'taskbasic/taskExceptions/batchUpdate',
      // 删除路径
      deleteUrl: 'taskbasic/taskExceptions/batchDelete',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        groupKey: ['exceptionName', 'classify'],
        groupKeyUrl: 'taskbasic/taskExceptions/queryAll',
        formData: [
          {key: 'exceptionName', label: '模板名称', type: 'input', maxlength: 50},
          {key: 'classify', label: '模板类型', type: 'tabs', tabsKey: 'exceptionClassify'},
          {key: 'taskNames', label: '任务', type: 'tree', selectButton: true, showCheckbox: true, class: 'auto-width', getOptions: '/taskbasic/taskExceptions/querySelectedTask', saveKey: 'taskNos', itemKey: 'taskNo', props: {label: 'taskName', children: 'children'}},
          {key: 'exceptionDesc', label: '模板描述', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          exceptionName: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          classify: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          key: 'exceptionName',
          value: '',
          type: 'select',
          inputText: '模板名称',
          getOptions: '/taskbasic/taskExceptions/queryExceptionName',
          span: 4,
          filterable: true
        }, {
          // 'p': '模板类型',
          key: 'classify',
          tabsKey: 'exceptionClassify',
          value: null,
          type: 'select',
          inputText: '模板类型',
          span: 4,
          optKey: 'key',
          optLabel: 'value',
          filterable: true
        }, {
          key: 'taskNo',
          value: '',
          type: 'select',
          inputText: '任务',
          getOptions: 'taskbasic/tasks/queryAll',
          span: 4,
          optKey: 'taskNo',
          optLabel: 'taskCn',
          filterable: true
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
        key: 'exceptionNo',
        multipleSelection: [],
        fields: [
          {prop: 'exceptionName', label: '模板名称', fixed: true, hidden: false},
          {prop: 'classify', label: '模板类型', fixed: false, hidden: false, optionKey: 'exceptionClassify'},
          {prop: 'taskNameStr', label: '任务名称', fixed: false, hidden: false, overflow: true},
          {prop: 'exceptionDesc', label: '模板描述', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    // 查询后的自定义方法
    customAfterQuery () {
      this.tableData.data.forEach(item => {
        if (item.hasOwnProperty('taskNames')) {
          this.$set(item, 'taskNameStr', item.taskNames.join(','))
        }
      })
    },
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'exceptionName') {
          queryAll(item.getOptions, {}).then(response => {
            if (response.data.code == 0) {
              this.$set(item, 'options', response.data.data)
            }
          })
        }
      })
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'taskNames') {
          let data = {
            'exceptionName': row['exceptionName'],
            'classify': row['classify']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'taskNames') {
          let data = {
            'exceptionName': row['exceptionName'],
            'classify': row['classify']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    }
  }
}
</script>
