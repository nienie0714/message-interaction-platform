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
    <Warning-box-view :data="editData" @handleConfirm="saveEditConform"></Warning-box-view>
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
import {postData} from '../../../api/base.js'
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
      baseUrl: 'organization/teamUnit',
      saveEditData: {},
      editData: {
        visible: false,
        loading: false,
        width: '500px',
        class: ' dialog-delete-warn',
        info: '确认修改数据吗？',
        warning: '班组人员变更将影响保障单元，操作不可恢复',
        data: null
      },
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'unitId',
        formData: [
          {key: 'unitId', label: '班组编号', type: 'input', maxlength: 9, isHidden: true},
          {key: 'unitName', label: '班组名称', type: 'input', maxlength: 30},
          {key: 'phone', label: '联系电话', type: 'input', maxlength: 15},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100},
          {key: 'allEmpIds', label: '员工', type: 'trans', class: 'auto-width', titles: ['未选员工', '已选员工'], getOptions: '/organization/unitEmployee/queryAllSelected', props: {key: 'key', label: 'label'}}
        ],
        rules: {
          unitName: [
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
          // 'p': '班组名称',
          key: 'unitName',
          value: '',
          type: 'input',
          inputText: '班组名称',
          span: 4
        }, {
          // 'p': '成员名称',
          key: 'teamUnitEmps',
          value: '',
          type: 'input',
          inputText: '成员名称',
          span: 4
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        // type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'unitId',
        multipleSelection: [],
        fields: [
          {prop: 'unitId', label: '班组编号', fixed: true, hidden: true},
          {prop: 'unitName', label: '班组名称', fixed: true, hidden: false},
          {prop: 'teamUnitEmps', label: '班组成员', fixed: false, hidden: false, overflow: true},
          {prop: 'phone', label: '联系电话', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    // 删除提示
    handleDeleteConfirm () {
      this.deleteData.loading = true
      postData(this.deleteUrl, this.deleteData.data).then(response => {
        if (response.data.code == 0) {
          this.showSuccess('删除')
          this.customMethod()
          this.queryDataReq()
        } else if (response.data.code == -1) {
          this.showError('删除', response.data.msg)
        } else {
          this.showError('删除')
        }
        this.deleteData.visible = false
        this.deleteData.loading = false
      }).catch(() => {
        this.deleteData.loading = false
      })
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].key == 'allEmpIds') {
          let data = {
            'unitId': null
          }
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
          if (this.formData.formData[i].key == 'allEmpIds') {
            let obj = {
              'unitId': data.currentRow['unitId']
            }
            this.$set(this.formData.formData[i], 'optionsQuery', obj)
          }
        }
      }
    },
    // 发送编辑保存请求
    saveEdit (data) {
      this.saveEditData = data
      this.editData.visible = true
      this.formData.loading = false
    },
    // 编辑提示
    saveEditConform () {
      this.formData.loading = true
      postData(this.editUrl, this.saveEditData).then(response => {
        if (response.data.code == 0) {
          this.formData.visible = false
          this.showSuccess('编辑')
          this.customMethod()
          this.queryDataReq()
        }
        this.formData.loading = false
        this.editData.visible = false
        this.editData.loading = false
      }).catch(() => {
        this.editData.loading = false
      })
    }
  }
}
</script>
