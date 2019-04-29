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
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload" @handleAdd="handleAdd" @handleDelete="handleDelete">
          <template slot="button-slot-scope">
            <div v-if="permissions.upMq" class="tool-div-button tool-bind" title="数据同步" @click="handleUpdateMqByDb"></div>
          </template>
        </Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete">
        <template slot="button-slot-scope" slot-scope="scopeData">
          <el-dropdown trigger="click" title="更多">
            <div class="tool-div-button button-reset"></div>
            <el-dropdown-menu slot="dropdown" class="morrow-button-dpd">
              <el-dropdown-item :divided="true" @click.native="handleReset(scopeData.data)">重置密码</el-dropdown-item>
              <el-dropdown-item :divided="true" @click.native="openSubscribeDia(scopeData.data)">绑定消息</el-dropdown-item>
              <el-dropdown-item :divided="true" @click.native="cloneInfo(scopeData.data)">克隆</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </Table-view>
    </el-main>
    <!-- openDetailDia -->
    <Edit-view :formData="formData" @handleAdd="openAddDia" @handleEdit="saveEdit" @handleReset="saveReset" @handleClone="saveClone"></Edit-view>
    <el-dialog  :visible.sync="subscribeData.visible" :close-on-click-modal="false" width="850px" append-to-body class='other-dialog menu-status-dialog' @close="closeSubscribeDialog">
      <div slot="title" class="dialog-header">
        <img :src="require('@img/title_deco.png')" />
        <span class="header-title">{{subscribeData.title}}</span>
      </div>
      <div class="dialog-body">
        <!-- <div :style ="{display: 'flex','justify-content': 'center','margin-bottom': '23px'}">
          <el-radio-group v-model="bindSelect" size="small" @change="changeBindSelect()">
            <el-radio-button label="binded">已绑定消息</el-radio-button>
            <el-radio-button label="binding">未绑定消息</el-radio-button>
          </el-radio-group>
        </div> -->
        <div>
          <el-row :gutter="20">
            <el-col :span="4"><div>用户名</div></el-col>
            <el-col :span="8"><el-input type="input" v-model.trim="subscribeData.data.consumerNo" disabled></el-input></el-col>
            <el-col :span="4"><div></div>账号到期时间</el-col>
            <el-col :span="8"><el-input type="input" v-model.trim="subscribeData.data.expiryTime" disabled></el-input></el-col>
          </el-row>
        </div>
        <div>
          <el-table height="430" ref="multipleTable" :data="subscribeData.tableData" stripe :highlight-current-row="true" :row-key="subscribeData.key" align="center" style="width: 100%" @selection-change="handleSubSelectionChange">
            <el-table-column type="selection" fixed="left" align="center" v-if="subscribeData.title == '绑定消息'"></el-table-column>
            <el-table-column prop="msgType" label="消息类型编号" align="center"></el-table-column>
            <el-table-column prop="msgTypeCn" label="消息类型名称" align="center"></el-table-column>
            <el-table-column prop="msgSubtype" label="消息子类型编号" align="center"></el-table-column>
            <el-table-column prop="msgSubtypeCn" label="消息子类型名称" align="center"></el-table-column>
            <el-table-column prop="msgPubType" label="消息发布类型" align="center"></el-table-column>
            <el-table-column prop="lifecycle" label="生命周期" align="center"></el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeSubscribeDialog">关 闭</el-button>
        <el-button type="primary" :loading="subscribeData.loading" @click="handleSaveAndBind()" v-if="subscribeData.title == '绑定消息'">确 定</el-button>
      </div>
    </el-dialog>
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
import {postData, getQueryAll} from '../../../api/base.js'
import _ from 'lodash'

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
        reset: true,
        upMq: true,
        bind: true
      },
      // 基础路径
      baseUrl: '/manage/consumer',
      upMqUrl: 'manage/consumer/updateMqByDb',
      addData: {},
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
          {key: 'isUseable', label: '是否启用', type: 'tabs', tabsKey: 'isYOrN', options: [], defaultValue: 'Y'}
        ],
        rules: {
          consumerNo: [
            {required: true, message: '必填项', trigger: 'blur'},
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
          {prop: 'consumerNo', label: '用户名', fixed: false, hidden: false},
          {prop: 'expiryTime', label: '账号到期时间', fixed: false, hidden: false},
          {prop: 'isConfirm', label: '是否确认', fixed: false, hidden: false, optionKey: 'isYOrN'},
          {prop: 'isUseable', label: '是否启用', fixed: false, hidden: false, optionKey: 'isYOrN'}
        ]
      },
      subscribeData: {
        loading: false,
        visible: false,
        key: 'msgTypeId',
        diaWidth: '800px',
        title: '绑定消息',
        url: 'manage/consumer/bind', // todo
        multipleSelection: [],
        tableData: [],
        data: {}
      },
      sourceConsumerNo: ''
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
        this.$set(this.formData.formData[i], 'isHidden', false)
        if (this.formData.formData[i].key == 'consumerNo') {
          this.$set(this.formData.formData[i], 'type', 'input')
        }
        if (this.formData.formData[i].key == 'expiryTime') {
          this.$delete(this.formData.formData[i], 'disabled')
          this.nowTime = new Date()
          this.$set(this.formData.formData[i], 'pickerOpt', this.pickerOptMethod)
        }
        if (this.formData.formData[i].key == 'isConfirm') {
          this.$delete(this.formData.formData[i], 'disabled')
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      this.subscribeData.title = '详情'
      this.subscribeData.visible = true
      this.subscribeData.data.consumerNo = row.consumerNo
      this.subscribeData.data.expiryTime = row.expiryTime
      getQueryAll(`manage/msgDefinition/bind/${this.subscribeData.data.consumerNo}`).then(res => {
        if (res.data.code == 0) {
          this.subscribeData.tableData = res.data.data
        }
      }).then(res => {
        this.checked()
      })
    },
    customSaveBefore (data) {
      var obj = {}
      if (this.formData.title == '编辑') {
        obj = JSON.parse(JSON.stringify(data))
        this.$delete(obj, 'consumerPwd')
      }
      return obj
    },
    openAddDia (data) {
      this.addData = data
      if (this.addData.consumerPwd != this.addData.confirmPassword) {
        this.showErrorCustom('两次密码输入不一致，请修改', '')
        this.formData.loading = false
        return
      }
      this.openSubscribeDia(data)
    },
    // 发送新增保存请求
    saveAdd (data) {
      if (data != null) {
        let msgTypeIds = this.subscribeData.multipleSelection.map(item => item.msgTypeId)
        this.$set(data, 'msgTypeIds', msgTypeIds)
        this.subscribeData.loading = true
        postData(this.addUrl, data).then(response => {
          if (response.data.code == 0) {
            this.formData.visible = false
            this.showSuccess('新增')
            this.closeSubscribeDialog()
            this.customMethod()
            this.queryDataReq()
          } else {
            this.subscribeData.loading = false
            this.showError('新增数据', response.data.msg)
          }
          this.formData.loading = false
        })
      } else {
        this.formData.loading = false
      }
    },
    // 克隆
    saveClone (data) {
      let obj = {'sourceConsumerNo': this.sourceConsumerNo, ...data}
      if (obj != null) {
        postData('manage/consumer/copyConsumer', obj).then(response => {
          if (response.data.code == 0) {
            this.formData.visible = false
            this.showSuccess('克隆')
            this.customMethod()
            this.queryDataReq()
          } else {
            this.showError('克隆', response.data.msg)
          }
          this.formData.loading = false
        })
      } else {
        this.formData.loading = false
      }
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
        } else if (this.formData.formData[i].key == 'isUseable') {
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$delete(this.formData.formData[i], 'disabled')
        } else if (this.formData.formData[i].key == 'expiryTime') {
          this.nowTime = new Date()
          this.$set(this.formData.formData[i], 'isHidden', false)
          this.$delete(this.formData.formData[i], 'disabled')
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
    },
    // 数据同步
    handleUpdateMqByDb () {
      postData(this.upMqUrl, {}).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('数据同步')
        } else {
          this.showError('数据同步', '请联系管理员 !')
        }
      })
    },
    openSubscribeDia (row) {
      this.subscribeData.data.consumerNo = row.consumerNo
      this.subscribeData.data.expiryTime = row.expiryTime
      getQueryAll('manage/msgDefinition/queryAll').then(res => {
        if (res.data.code == 0) {
          this.subscribeData.tableData = res.data.data
          this.subscribeData.tableData.forEach(item => {
            if (item.msgPubType == '1') {
              this.$set(item, 'msgPubTypeCn', '广播')
            } else if (item.msgPubType == '2') {
              this.$set(item, 'msgPubTypeCn', '单播')
            }
          })
          getQueryAll(`manage/msgDefinition/bind/${this.subscribeData.data.consumerNo}`).then(res => {
            if (res.data.code == 0) {
              res.data.data.forEach(row => {
                let obj = _.find(this.subscribeData.tableData, [this.subscribeData.key, row[this.subscribeData.key]])
                this.subscribeData.multipleSelection.push(obj)
              })
            }
          }).then(res => {
            this.checked()
          })
        } else {
          this.showError('获取消息类型列表', '请重新尝试 !')
        }
      })
      this.subscribeData.visible = true
    },
    checked () {
      this.subscribeData.multipleSelection.filter(item => {
        this.$refs.multipleTable.toggleRowSelection(item, true)
      })
    },
    closeSubscribeDialog () {
      this.subscribeData.title = '绑定消息'
      if (this.formData.visible) {
        this.formData.loading = false
      }

      this.subscribeData.loading = false
      this.subscribeData.visible = false
      // 清空数据
      this.subscribeData.data = {}
      this.subscribeData.tableData = []
      this.subscribeData.multipleSelection = []
    },
    handleSubSelectionChange (val) {
      this.subscribeData.multipleSelection = val
    },
    handleSaveAndBind (data) {
      if (this.formData.visible) {
        this.saveAdd(this.addData)
      } else {
        this.handleSubscribeConfirm()
      }
    },
    handleSubscribeConfirm () {
      let msgTypeIds = this.subscribeData.multipleSelection.map(item => item.msgTypeId)
      this.$set(this.subscribeData.data, 'msgTypeIds', msgTypeIds)
      this.subscribeData.loading = true
      // 消费者绑定接口
      postData(this.subscribeData.url, this.subscribeData.data).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('操作')
          this.closeSubscribeDialog()
          this.queryDataReq(1)
        } else {
          this.subscribeData.loading = false
          this.showError('消费者绑定', '请重新尝试 !')
        }
      })
    },
    cloneInfo (row) {
      this.sourceConsumerNo = row.consumerNo
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', '')
        this.$set(this.formData.formData[i], 'isHidden', false)
        if (this.formData.formData[i].key == 'consumerNo') {
          this.$set(this.formData.formData[i], 'type', 'input')
        }
        if (this.formData.formData[i].key == 'expiryTime') {
          this.nowTime = new Date()
          this.$set(this.formData.formData[i], 'pickerOpt', this.pickerOptMethod)
        }
        if (this.formData.formData[i].key == 'isConfirm') {
          this.$delete(this.formData.formData[i], 'disabled')
        }
      }
      this.formData.title = '克隆'
      this.formData.visible = true
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
