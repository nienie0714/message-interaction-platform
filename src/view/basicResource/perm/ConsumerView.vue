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
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete">
        <template slot="button-slot-scope" slot-scope="scopeData">
          <div v-if="permissions.reset" class="tool-div-button button-reset" title="重置密码" @click="handleReset(scopeData.data)"></div>
        </template>
      </Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit" @handleReset="saveReset"></Edit-view>
    <Warning-box-view :data="deleteData" @handleConfirm="handleDeleteConfirm" @handleClose="handleDeleteClose"></Warning-box-view>
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
import {postData} from '../../../api/base.js'

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
      baseUrl: '/manage/consumer',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'userName',
        formData: [
          {key: 'consumerNo', label: '用户名', type: 'input', minlength: 1, maxlength: 20},
          {key: 'consumerPwd', label: '密码', type: 'password', minlength: 4, maxlength: 18, isHidden: false},
          {key: 'confirmPassword', label: '确认密码', type: 'password', minlength: 4, maxlength: 18, isHidden: false},
          {key: 'expiryTime', label: '过期时间', type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss', valueFormat: 'yyyy-MM-dd HH:mm:ss', defaultValue: '', pickerOpt: this.pickerOptMethod, change: this.expiryValidator},
          {key: 'isConfirm', label: '是否确认', type: 'tabs', tabsKey: 'isYOrN', options: [], defaultValue: 'N'},
          {key: 'isUseable', label: '是否启用', type: 'tabs', tabsKey: 'isYOrN', options: []}
        ],
        rules: {
          consumerNo: [
            {required: true, message: '消费者编号不能为空', trigger: 'blur'},
            {validator: consumerReg, trigger: 'blur'}
          ],
          consumerPwd: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: passwordReg418, trigger: 'blur'}
          ],
          confirmPassword: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: passwordReg418, trigger: 'blur'}
          ]
        }
      },
      pickerOptMethod: {
        disabledDate: (time) => {
          return (time.getTime() < new Date(this.nowTime).getTime() - 8.64e7)
        }
      },
      nowTime: null,
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '用户名',
          key: 'consumerNo',
          value: '',
          type: 'input',
          inputText: '用户名',
          span: 4
        }, {
          p: '是否过期',
          key: 'isExpiry',
          tabsKey: 'isYOrN',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 4
        }, {
          p: '是否启用',
          key: 'isUseable',
          tabsKey: 'isYOrN',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
          'span': 4
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
        key: 'consumerNo',
        multipleSelection: [],
        fields: [
          {prop: 'consumerNo', label: '用户名', fixed: true, hidden: false},
          {prop: 'isConfirm', label: '是否确认', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'expiryTime', label: '账号到期时间', fixed: true, hidden: false},
          {prop: 'isUseable', label: '是否启用', fixed: false, hidden: false, optionKey: 'isYOrN'}
        ]
      }
    }
  },
  mounted () {
    this.formData.formData[3].pickerOpt = {
      disabledDate: (time) => {
        return (time.getTime() < new Date(this.nowTime).getTime() - 8.64e7)
      }
    }
  },
  methods: {
    expiryValidator (val) {
      if (new Date() > new Date(val)) {
        this.showErrorCustom('过期时间必须大于当前时间 ！', '')
      }
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', '')
        this.$set(this.formData.formData[i], 'disabled', false)
        this.$set(this.formData.formData[i], 'isHidden', false)
        if (this.formData.formData[i].key == 'consumerNo') {
          this.$set(this.formData.formData[i], 'type', 'input')
        }
        if (this.formData.formData[i].key == 'expiryTime') {
          this.nowTime = new Date()
          this.$set(this.formData.formData[i], 'pickerOpt', this.pickerOptMethod)
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'consumerPwd' || this.formData.formData[i].key == 'confirmPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
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
        this.$delete(obj, 'consumerPwd')
      }
      if (this.formData.title == '新增') {
        obj = JSON.parse(JSON.stringify(data))
        if (obj.consumerPwd != obj.confirmPassword) {
          this.showErrorCustom('两次密码输入不一致，请修改', '')
          return
        }
      }
      return obj
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].key == 'consumerPwd' || this.formData.formData[i].key == 'confirmPassword') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        } else if (this.formData.formData[i].key == 'consumerNo') {
          this.$set(this.formData.formData[i], 'type', 'pInput')
          this.$set(this.formData.formData[i], 'isHidden', false)
        } else if (this.formData.formData[i].key == 'isConfirm') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'disabled', true)
        } else if (this.formData.formData[i].key == 'expiryTime') {
          this.nowTime = new Date()
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'pickerOpt', this.pickerOptMethod)
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
        if (this.formData.formData[i].key == 'consumerNo') {
          this.$set(this.formData.formData[i], 'type', 'pInput')
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        } else if (this.formData.formData[i].key == 'consumerPwd' || this.formData.formData[i].key == 'confirmPassword') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$set(this.formData.formData[i], 'value', '')
        } else {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
      }
      console.log(this.formData.formData)
      this.formData.title = '重置密码'
      this.formData.visible = true
    },
    customResetBefore (data) {
      var obj = JSON.parse(JSON.stringify(data))
      if (obj.consumerPwd != obj.confirmPassword) {
        this.showErrorCustom('两次密码输入不一致，请修改', '')
        return
      }
      return obj
    },
    // 发送重置密码请求
    saveReset (data) {
      var obj = this.customResetBefore(data)
      if (obj != null) {
        postData(this.resetUrl, obj).then(response => {
          if (response.data.code == 0) {
            this.formData.visible = false
            this.showSuccess('密码重置')
            this.customMethod()
            this.queryDataReq(1)
          } else {
            this.showError('密码重置')
          }
          this.formData.loading = false
        })
      } else {
        this.formData.loading = false
      }
    }
  }
}
</script>
