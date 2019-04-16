<template>
  <el-container>
    <el-header class="query-contain">
      <Query-view :data="queryRowGroup" class="left" @keyupEnter="queryDataReq()"></Query-view>
      <div class="left-button">
        <el-button type="info" icon="el-icon-search" plain @click="clearTableQuery()">清空</el-button>
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
import {idNumReg, sixNum, phoneReg} from '../../../util/rules.js'
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
  props: ['deptParentId'],
  data () {
    return {
      // 基础路径
      baseUrl: 'organization/department',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'deptId',
        clearRulesKey: ['reserved1'],
        formData: [
          {key: 'deptId', label: '部门编号', type: 'input', maxlength: 9, isHidden: true},
          {key: 'reserved1', label: '部门编号', type: 'input', maxlength: 6},
          {key: 'phone', label: '联系电话', type: 'input', maxlength: 15},
          {key: 'deptName', label: '部门名称', type: 'textarea', autosize: true, maxlength: 50},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'parentIds', label: '上级部门', type: 'casc', class: 'auto-width', saveKey: 'deptParentId', getOptions: '/organization/department/queryDeptTreeByUserId', props: {value: 'id', label: 'text', children: 'children'}}
        ],
        rules: {
          reserved1: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: sixNum, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          deptName: [
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
          // 'p': '部门名称',
          key: 'deptName',
          value: '',
          type: 'input',
          inputText: '部门名称',
          span: 4
        }, {
          // 'p': '联系电话',
          key: 'phone',
          value: '',
          type: 'input',
          inputText: '联系电话',
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
        key: 'deptId',
        multipleSelection: [],
        fields: [
          {prop: 'deptId', label: '部门编号', fixed: true, hidden: true},
          {prop: 'reserved1', label: '部门编号', fixed: true, hidden: false},
          {prop: 'deptName', label: '部门名称', fixed: false, hidden: false},
          {prop: 'pDeptName', label: '上级部门', fixed: false, hidden: false},
          {prop: 'phone', label: '联系电话', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    clearTableQuery (value) {
      var data = this.queryList
      this.queryList.forEach((item, index) => {
        if (typeof (item.value) == 'number') {
          data[index].value = 0
        } else if (typeof (item.value) == 'string') {
          data[index].value = null
        } else if (typeof (item.value) == 'boolean') {
          data[index].value = false
        } else if (typeof (item.value) == 'undefined') {
          data[index].value = item.value
        } else {
          data[index].value = null
        }
      })
      this.queryList = data
      if (value) {
        this.queryList.push({key: 'deptParentId', value: value})
      } else {
        this.queryList.push({key: 'deptParentId', value: this.deptParentId})
      }
      this.queryDataReq()
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].key == 'parentIds') {
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
          if (this.formData.formData[i].key == 'parentIds') {
            let obj = {
              'deptId': data.currentRow['deptId']
            }
            this.$set(this.formData.formData[i], 'optionsQuery', obj)
          }
        }
      }
    },
    // 自定义方法：保存成功后重新获取树
    customMethod () {
      this.$transfer.$emit('updateTree')
    }
  },
  watch: {
    deptParentId: function (newValue, oldValue) {
      this.clearTableQuery(newValue)
    }
  }
}
</script>
