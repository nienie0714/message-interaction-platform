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
import {queryAll} from '../../../api/base.js'
import {idNumReg, phoneReg} from '../../../util/rules.js'

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
      baseUrl: 'organization/team',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'teamId',
        groupKey: ['unitId', 'teamName'],
        groupKeyDisabled: ['unitId'],
        groupKeyUrl: 'organization/team/queryAll',
        formData: [
          {key: 'teamId', label: '保障单元编号', type: 'input', maxlength: 9, isHidden: true},
          {key: 'unitId', label: '所在班组', type: 'select', filterable: true, clearable: true, getOptions: '/organization/teamUnit/queryAll', defaultValue: true, itemKey: 'unitId', itemLabel: 'unitName', change: this.changeUnit},
          {key: 'teamName', label: '保障单元名称', type: 'input', maxlength: 30},
          {key: 'phone', label: '联系电话', type: 'input', maxlength: 15},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'allEmpIds', label: '员工', type: 'trans', class: 'auto-width', titles: ['班组员工', '已选员工'], props: {key: 'key', label: 'label'}}
        ],
        rules: {
          teamName: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          phone: [
            {validator: phoneReg, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '保障单元名称',
          key: 'teamName',
          value: '',
          type: 'input',
          inputText: '保障单元名称',
          span: 4
        }, {
          // 'p': '成员名称',
          key: 'teamEmps',
          value: '',
          type: 'input',
          inputText: '成员名称',
          span: 4
        }, {
          // p: '所在班组',
          key: 'unitId',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '所在班组',
          getOptions: '/organization/teamUnit/queryAll',
          optKey: 'unitId',
          optLabel: 'unitName',
          filterKeys: ['unitId', 'unitName'],
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
        key: 'teamId',
        multipleSelection: [],
        fields: [
          {prop: 'teamId', label: '保障单元编号', fixed: true, hidden: true},
          {prop: 'teamName', label: '保障单元名称', fixed: false, hidden: false},
          {prop: 'unitName', label: '所在班组', fixed: false, hidden: false},
          {prop: 'teamEmps', label: '保障单元成员', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    changeUnit (value, callback) {
      let allEmpIds = {
        key: 'allEmpIds',
        value: []
      }
      var obj = {
        'unitId': value,
        'teamId': null
      }
      if (this.formData.title != '新增') {
        obj.teamId = this.formData.formData[0].value
      }
      if (value) {
        queryAll('/organization/teamemployee/queryAllSelected', obj).then(response => {
          if (response.data.code == 0) {
            for (let i = 0; i < this.formData.formData.length; i++) {
              if (this.formData.formData[i].key == 'allEmpIds') {
                this.$set(this.formData.formData[i], 'options', response.data.data.all)
                this.$set(allEmpIds, 'value', response.data.data.selected)
                callback(allEmpIds)
                return
              }
            }
          } else {
            callback(allEmpIds)
            return null
          }
        })
      } else {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'allEmpIds') {
            this.$set(this.formData.formData[i], 'options', [])
            callback(allEmpIds)
            return
          }
        }
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].key == 'allEmpIds') {
          this.$delete(this.formData.formData[i], 'optionsQuery')
          this.$delete(this.formData.formData[i], 'getOptions')
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'allEmpIds') {
          let data = {
            'teamId': row['teamId'],
            'unitId': row['unitId']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
          this.$set(this.formData.formData[i], 'getOptions', '/organization/teamemployee/queryAllSelected')
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'allEmpIds') {
          let data = {
            'teamId': row['teamId'],
            'unitId': row['unitId']
          }
          this.$set(this.formData.formData[i], 'optionsQuery', data)
          this.$set(this.formData.formData[i], 'getOptions', '/organization/teamemployee/queryAllSelected')
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    }
  }
}
</script>
