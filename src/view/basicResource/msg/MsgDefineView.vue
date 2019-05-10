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
            <div v-if="permissions.upMqAll" class="tool-div-button tool-bind" title="数据同步" @click="handleUpdateMqByDb"></div>
          </template>
        </Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete">
        <template slot="button-slot-scope" slot-scope="scopeData">
          <div v-if="permissions.upMq" class="tool-div-button button-default" title="订阅关系配置" @click="openSubscribeDia(scopeData.data)"></div>
        </template>
      </Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit"></Edit-view>
    <el-dialog  :visible.sync="subscribeData.visible" :close-on-click-modal="false" width="800px" append-to-body class='other-dialog menu-status-dialog' @close="closeSubscribeDialog">
      <div slot="title" class="dialog-header">
        <img :src="require('@img/title_deco.png')" />
        <span class="header-title">{{subscribeData.title}}</span>
      </div>
      <div class="dialog-body">
        <!-- <div :style ="{display: 'flex','justify-content': 'center','margin-bottom': '23px'}">
          <el-radio-group v-model="bindSelect" size="small" @change="changeBindSelect()">
            <el-radio-button label="binded">已绑定用户</el-radio-button>
            <el-radio-button label="binding">未绑定用户</el-radio-button>
          </el-radio-group>
        </div> -->
        <div>
          <el-row :gutter="20">
            <el-col :span="4"><div>消息类型编号</div></el-col>
            <el-col :span="8"><el-input type="input" v-model.trim="subscribeData.data.msgType" disabled></el-input></el-col>
            <el-col :span="4"><div></div>消息子类型编号</el-col>
            <el-col :span="8"><el-input type="input" v-model.trim="subscribeData.data.msgSubtype" disabled></el-input></el-col>
          </el-row>
        </div>
        <div>
          <el-table height="430" ref="multipleTable" :data="subscribeData.tableData" stripe :highlight-current-row="true" align="center" style="width: 100%" @selection-change="handleSubSelectionChange">
            <el-table-column type="selection" fixed="left" align="center"></el-table-column>
            <el-table-column prop="consumerNo" label="用户名" align="center"></el-table-column>
            <el-table-column prop="expiryTime" label="过期时间" align="center"></el-table-column>
            <el-table-column prop="isConfirmCn" label="是否确认" align="center"></el-table-column>
            <el-table-column prop="isUseableCn" label="是否启用" align="center"></el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeSubscribeDialog">关 闭</el-button>
        <el-button type="primary" :loading="subscribeData.loading" @click="handleSubscribeConfirm()">确 定</el-button>
      </div>
    </el-dialog>
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
import { queryAll, getQueryAll, postData } from '../../../api/base.js'
import _ from 'lodash'
import {twoDecimal, threeD, phoneReg, maxENReg, msgNoValidator, msgCnValidator, remarkReg} from '../../../util/rules.js'

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
      baseUrl: 'manage/msgDefinition',
      upMqUrl: 'manage/consumer/updateMqByDb',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'msgTypeId',
        formData: [
          {key: 'msgTypeId', label: '消息类型Id', type: 'input', isHidden: 'true', maxlength: 50},
          {key: 'msgType', label: '消息类型编号', type: 'input', maxlength: 50},
          {key: 'msgTypeCn', label: '消息类型名称', type: 'input', maxlength: 20},
          {key: 'msgSubtype', label: '消息子类型编号', type: 'input', maxlength: 50},
          {key: 'msgSubtypeCn', label: '消息子类型名称', type: 'input', maxlength: 20},
          {key: 'priority', label: '优先级', type: 'number', position: 'right', min: 0, step: 1, max: 10},
          {key: 'lifecycle', label: '生命周期', type: 'number', position: 'right', min: 0, step: 1},
          {key: 'remark', label: '备注', type: 'textarea', class: 'auto-height auto-width', autosize: true, maxlength: 50}
        ],
        rules: {
          msgType: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: msgNoValidator, trigger: 'blur'}
          ],
          msgTypeCn: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: msgCnValidator, trigger: 'blur'}
          ],
          msgSubtype: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: msgNoValidator, trigger: 'blur'}
          ],
          msgSubtypeCn: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: msgCnValidator, trigger: 'blur'}
          ],
          remark: [
            {validator: remarkReg, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '消息类型',
          key: 'msgType',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '消息类型编号',
          getOptions: 'manage/msgDefinition/type/msgType',
          optKey: 'msgType',
          optLabel: 'msgType',
          span: 3
        }, {
          // 'p': '消息子类型',
          key: 'msgSubtype',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '消息子类型编号',
          getOptions: 'manage/msgDefinition/type/msgSubtype',
          optKey: 'msgSubtype',
          optLabel: 'msgSubtype',
          span: 3
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
        key: 'msgTypeId',
        multipleSelection: [],
        fields: [
          {prop: 'msgTypeId', label: '消息类型Id', fixed: false, hidden: true},
          {prop: 'msgType', label: '消息类型编号', fixed: false, hidden: false},
          {prop: 'msgTypeCn', label: '消息类型名称', fixed: false, hidden: false},
          {prop: 'msgSubtype', label: '消息子类型编号', fixed: false, hidden: false},
          {prop: 'msgSubtypeCn', label: '消息子类型名称', fixed: false, hidden: false},
          {prop: 'priority', label: '优先级', fixed: false, hidden: false},
          {prop: 'lifecycle', label: '生命周期', fixed: false, hidden: false} // 0表示永久消息
        ]
      },
      subscribeData: {
        loading: false,
        visible: false,
        key: 'consumerNo',
        diaWidth: '800px',
        title: '订阅关系配置',
        url: 'manage/msgDefinition/rebind', // todo
        multipleSelection: [],
        tableData: [],
        data: {}
      },
      bindSelect: 'binding'
    }
  },
  methods: {
    customMethod () { // 新增后重新获取下拉框列表数据
      this.queryList.forEach(item => {
        if (item.key == 'msgType') {
          getQueryAll(item.getOptions).then(response => {
            if (response.data.code == 0) {
              let b = []
              _.forEach(response.data.data, item => {
                if (_.findIndex(b, function (o) {
                  return o.msgType == item.msgType
                }) == -1) {
                  b.push(item)
                }
              })
              this.$set(item, 'options', b)
            }
          })
        } else if (item.key == 'msgSubtype') {
          queryAll(item.getOptions).then(response => {
            if (response.data.code == 0) {
              let b = []
              _.forEach(response.data.data, item => {
                if (_.findIndex(b, function (o) {
                  return o.msgSubtype == item.msgSubtype
                }) == -1) {
                  b.push(item)
                }
              })
              this.$set(item, 'options', b)
            }
          })
        }
      })
    },
    customSaveBefore (data) {
      var obj = {}
      obj = JSON.parse(JSON.stringify(data))
      this.$set(obj, 'priority', parseInt(obj.priority))
      this.$set(obj, 'lifecycle', parseInt(obj.lifecycle))
      return obj
    },
    // 数据同步 todo 修改Url即可
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
      this.subscribeData.data.msgType = row.msgType
      this.subscribeData.data.msgTypeId = row.msgTypeId
      this.subscribeData.data.msgSubtype = row.msgSubtype
      getQueryAll('manage/consumer/queryAll').then(res => {
        if (res.data.code == 0) {
          this.subscribeData.tableData = res.data.data
          this.subscribeData.tableData.forEach(item => {
            if (item.isConfirm == 'Y') {
              this.$set(item, 'isConfirmCn', '是')
            } else if (item.isConfirm == 'N') {
              this.$set(item, 'isConfirmCn', '否')
            } else if (item.isConfirm == '') {
              this.$set(item, 'isConfirmCn', '')
            }
            if (item.isUseable == 'Y') {
              this.$set(item, 'isUseableCn', '是')
            } else if (item.isUseable == 'N') {
              this.$set(item, 'isUseableCn', '否')
            } else if (item.isUseable == '') {
              this.$set(item, 'isUseableCn', '')
            }
          })
          getQueryAll(`/manage/consumer/subscribe/${this.subscribeData.data.msgTypeId}`).then(res => {
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
          this.showError('获取消费者列表', '请重新尝试 !')
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
    handleSubscribeConfirm () {
      let consumerNos = this.subscribeData.multipleSelection.map(item => item.consumerNo)
      this.$set(this.subscribeData.data, 'consumerNos', consumerNos)
      this.subscribeData.loading = true
      postData(this.subscribeData.url, this.subscribeData.data).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('操作')
          this.closeSubscribeDialog()
          this.queryDataReq(1)
        } else {
          this.subscribeData.loading = false
          this.showError('订阅关系配置', '请重新尝试 !')
        }
      })
    }
  }
}
</script>
