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
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @change="tableChange" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete">
        <!-- <template slot="button-slot-scope" slot-scope="scopeData">
          <div v-if="permissions.reset" class="tool-div-button button-reset" title="重置密码" @click="handleReset(scopeData.data)"></div>
          <div v-if="permissions.cgPwd" class="tool-div-button button-reset" title="修改密码" @click="handlePwd(scopeData.data)"></div>
        </template> -->
        <template slot="button-slot-scope" slot-scope="scopeData">
          <el-dropdown trigger="click" title="更多">
            <div class="tool-div-button button-reset"></div>
            <el-dropdown-menu slot="dropdown" class="morrow-button-dpd">
              <el-dropdown-item :divided="true" @click.native="handleReset(scopeData.data)">重置密码</el-dropdown-item>
              <el-dropdown-item :divided="true" @click.native="handlePwd(scopeData.data)">修改密码</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit" @handleReset="saveReset" @handlePwd="savePassword"></Edit-view>
    <Warning-box-view :data="deleteData" @handleConfirm="handleDeleteConfirm" @handleClose="handleDeleteClose"></Warning-box-view>
    <Warning-box-view :data="canNotDeleteData"></Warning-box-view>
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
import {passwordReg, passwordReg418, consumerReg} from '../../../util/rules.js'
import {postData, delData} from '../../../api/base.js'

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
      // 菜单对应按钮权限
      permissions: {
        add: true,
        update: true,
        delete: true,
        reset: true
      },
      // 基础路径
      baseUrl: '/manage/sysUser',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'userName',
        formData: [
          {key: 'userName', label: '登录账号', type: 'input', maxlength: 20},
          {key: 'nickname', label: '用户名', type: 'input', maxlength: 20},
          {key: 'password', label: '密码', type: 'password', minlength: 4, maxlength: 18},
          {key: 'newPassword', label: '新密码', type: 'password', minlength: 4, maxlength: 18, isHidden: true},
          // {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
          {key: 'resourceIds', label: '资源', type: 'tree', showCheckbox: true, class: 'auto-width', getOptions: `/manage/sysResource/queryAllSelected`, itemKey: 'id', props: {label: 'text', children: 'children'}, isHidden: true}
        ],
        rules: {
          nickname: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: consumerReg, trigger: 'blur'}
          ],
          userName: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: consumerReg, trigger: 'blur'}
          ],
          password: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: passwordReg418, trigger: 'blur'}
          ],
          newPassword: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: passwordReg418, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '用户名',
          key: 'nickname',
          value: '',
          type: 'input',
          inputText: '用户名',
          span: 4
        },
        {
          // 'p': '用户名',
          key: 'userName',
          value: '',
          type: 'input',
          inputText: '登录账号',
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
        key: 'userName',
        multipleSelection: [],
        fields: [
          {prop: 'nickname', label: '用户名', hidden: false},
          {prop: 'userName', label: '登录账号', hidden: false},
          {prop: 'password', label: '密码', hidden: true}
        ]
      },
      canNotDeleteData: {
        visible: false,
        loading: false,
        hiddenConfirm: true,
        width: '500px',
        class: ' dialog-delete-warn',
        info: '不能删除正在登陆的用户',
        data: null
      }
    }
  },
  methods: {
    // 列表选中事件
    tableChange (data) {
      if (data.currentRow) {
        for (let i = 0; i < this.formData.formData.length; i++) {
          this.$set(this.formData.formData[i], 'value', data.currentRow[this.formData.formData[i].key])
          // if (this.formData.formData[i].key == 'resourceIds') {
          //   let obj = {
          //     'userName': data.currentRow['userName']
          //   }
          //   this.$set(this.formData.formData[i], 'optionsQuery', obj)
          // }
        }
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', '')
        this.$set(this.formData.formData[i], 'isHidden', false)
        if (this.formData.formData[i].key == 'newPassword') {
          this.formData.formData[i].isHidden = true
        } else if (this.formData.formData[i].key == 'userName') {
          this.$set(this.formData.formData[i], 'type', 'input')
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else if (this.formData.formData[i].key == 'resourceIds') {
            this.$set(this.formData.formData[i], 'optionsQuery', null)
            this.$set(this.formData.formData[i], 'isHidden', false)
          }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password' || this.formData.formData[i].key == 'newPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        } else if (this.formData.formData[i].key == 'resourceIds') {
          let data = row.userName
          this.$set(this.formData.formData[i], 'optionsQuery', data)
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else {
          this.$set(this.formData.formData[i], 'isHidden', false)
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    customSaveBefore (data) {
      var obj = {}
      if (this.formData.title == '编辑') {
        obj = JSON.parse(JSON.stringify(data))
        this.$delete(obj, 'password')
        this.$delete(obj, 'newPassword')
      }
      if (this.formData.title == '新增') {
        obj = JSON.parse(JSON.stringify(data))
      }
      return obj
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password' || this.formData.formData[i].key == 'newPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        } else if (this.formData.formData[i].key == 'userName') {
          this.$set(this.formData.formData[i], 'type', 'pInput')
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else if (this.formData.formData[i].key == 'resourceIds') {
          let data = row.userName
          this.$set(this.formData.formData[i], 'optionsQuery', data)
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else {
          this.$set(this.formData.formData[i], 'isHidden', false)
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    },
    // 重置
    handleReset (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'value', '')
        } else if (this.formData.formData[i].key == 'userName') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'type', 'pInput')
        } else {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
      }
      this.formData.title = '重置密码'
      this.formData.visible = true
    },
    // 发送重置密码请求
    saveReset (data) {
      postData(this.resetUrl, data).then(response => {
        if (response.data.code == 0) {
          this.formData.visible = false
          this.showSuccess('密码重置')
          this.customMethod()
          this.queryDataReq(1)
        }
        this.formData.loading = false
      })
    },
    // 修改密码
    handlePwd (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'password' || this.formData.formData[i].key == 'newPassword') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'value', '')
        } else {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
      }
      this.formData.title = '修改密码'
      this.formData.visible = true
    },
    // 发送修改密码请求
    savePassword (data) {
      postData(this.pwUrl, data).then(response => {
        if (response.data.code == 0) {
          this.formData.visible = false
          this.showSuccess('密码修改')
          this.customMethod()
          this.queryDataReq(1)
        } else if (response.data.code == -1) {
            this.showError('修改密码', response.data.msg)
        }
        this.formData.loading = false
      })
    },
    // 删除
    handleDelete (row) {
      let data = []
      if (row) {
        if (row[this.tableData.key] == localStorage.getItem('userName')) {
          this.canNotDeleteData.visible = true
          return
        }
        data.push(row[this.tableData.key])
      } else {
        this.tableData.multipleSelection.forEach(item => {
          if (item[this.tableData.key] != localStorage.getItem('userName')) {
            data.push(item[this.tableData.key])
          }
        })
        if (data.length == 0) {
          this.canNotDeleteData.visible = true
          return
        }
      }
      this.deleteData.data = data.join(',')
      this.deleteData.visible = true
      document.addEventListener('keypress', this.handleDeleteConfirm, false)
    },
    handleDeleteConfirm (event) {
      if ((event && event.keyCode == 13) || !event) {
        this.deleteData.loading = true
        delData(this.deleteUrl, this.deleteData.data).then(response => {
          if (response.data.code == 0) {
            this.showSuccess('删除')
            this.customMethod()
            this.queryDataReq(1)
            this.handleDeleteClose()
          } else {
            this.showError('删除', response.data.msg)
          }
          this.deleteData.loading = false
        }).catch(() => {
          this.deleteData.loading = false
        })
      }
    }
  }
}
</script>
<style>
.menu-status-dialog>.el-dialog {
  height: 600px;
}
.morrow-button-dpd>li:first-of-type {
  border-top: 0;
}
.morrow-button-dpd .el-dropdown-menu__item--divided {
  margin-top: 0;
  border-top: 1px solid rgba(60, 166, 200, 0.3);
}
.morrow-button-dpd .el-dropdown-menu__item--divided:before {
  height: 0 !important;
}
</style>
