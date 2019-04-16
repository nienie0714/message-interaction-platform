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
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @change="tableChange" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete"></Table-view>
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
      baseUrl: 'sys/role',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'roleId',
        formData: [
          {key: 'roleId', label: '角色编号', type: 'input', maxlength: 20, isHidden: true},
          {key: 'name', label: '角色名称', type: 'input', maxlength: 20},
          {key: 'description', label: '角色描述', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'resourceIds', label: '资源', type: 'tree', showCheckbox: true, class: 'auto-width', getOptions: '/sys/resource/queryAllSelected', itemKey: 'id', props: {label: 'text', children: 'children'}}
        ],
        rules: {
          name: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '角色名称',
          key: 'name',
          value: '',
          type: 'input',
          inputText: '角色名称',
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
        key: 'roleId',
        multipleSelection: [],
        fields: [
          {prop: 'name', label: '角色名称', fixed: true, hidden: false, overflow: true},
          {prop: 'description', label: '角色描述', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          this.$set(this.formData.formData[i], 'value', data.currentRow[this.formData.formData[i].key])
          if (this.formData.formData[i].key == 'resourceIds') {
            let obj = {
              'roleId': data.currentRow['roleId']
            }
            this.$set(this.formData.formData[i], 'optionsQuery', obj)
          }
        }
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].key == 'resourceIds') {
            let data = {}
            this.$set(this.formData.formData[i], 'optionsQuery', data)
          }
        }
      this.formData.title = '新增'
      this.formData.visible = true
    }
  }
}
</script>
