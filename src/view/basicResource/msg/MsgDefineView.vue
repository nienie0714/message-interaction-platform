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
import { queryAll, getQueryAll, postData } from '../../../api/base.js'
import _ from 'lodash'
import {twoDecimal, threeD, phoneReg, maxENReg, msgNoValidator, msgCnValidator} from '../../../util/rules.js'

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
      baseUrl: 'manage/msgDefinition',
      queryUrl: 'manage/msgDefinition/queryAll',
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
          {key: 'msgTypeCn', label: '消息类型名称', type: 'input', maxlength: 18},
          {key: 'msgSubtype', label: '消息子类型编号', type: 'input', maxlength: 50},
          {key: 'msgSubtypeCn', label: '消息子类型名称', type: 'input', maxlength: 18},
          {key: 'msgPubType', label: '消息发布类型', type: 'tabs', tabsKey: 'msgType', options: []},
          {key: 'lifecycle', label: '生命周期', type: 'number', position: 'right', min: 0, step: 1},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
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
          inputText: '消息类型',
          getOptions: '/manage/msgDefinition/queryAll',
          optKey: 'msgType',
          optLabel: 'msgTypeCn',
          span: 3
        }, {
          // 'p': '消息子类型',
          key: 'msgSubtype',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '消息子类型',
          getOptions: '/manage/msgDefinition/queryAll',
          optKey: 'msgSubtype',
          optLabel: 'msgSubtypeCn',
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
          {prop: 'msgTypeId', label: '消息类型Id', fixed: true, hidden: true},
          {prop: 'msgType', label: '消息类型编号', fixed: true, hidden: false},
          {prop: 'msgTypeCn', label: '消息类型名称', fixed: false, hidden: false},
          {prop: 'msgSubtype', label: '消息子类型编号', fixed: false, hidden: false},
          {prop: 'msgSubtypeCn', label: '消息子类型名称', fixed: false, hidden: false},
          {prop: 'msgPubType', label: '消息发布类型', fixed: false, hidden: false, optionKey: 'msgType'},
          {prop: 'lifecycle', label: '生命周期', fixed: false, hidden: false} // 0表示永久消息
        ]
      }
    }
  },
  methods: {
    customMethod () { // 新增后重新获取下拉框列表数据
      this.queryList.forEach(item => {
        if (item.key == 'msgType') {
          getQueryAll(item.getOptions).then(response => {
            if (response.data.code == 0) {
              let arr1 = _.unionBy(response.data.data, 'msgType')
              this.$set(item, 'options', arr1)
            }
          })
        } else if (item.key == 'msgSubtype') {
          queryAll(item.getOptions).then(response => {
            if (response.data.code == 0) {
              let arr2 = _.unionBy(response.data.data, 'msgSubtype')
              this.$set(item, 'options', arr2)
            }
          })
        }
      })
    },
    // 一键绑定
    handleUpdateMqByDb () {
      postData(this.upMqUrl, {}).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('数据同步')
        } else {
          this.showError('数据同步', '请联系管理员 !')
        }
      })
    }
  }
}
</script>
