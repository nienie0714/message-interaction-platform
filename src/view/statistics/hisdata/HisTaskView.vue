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
    <div class="dialog-form-edit statistics-dialog">
      <el-dialog :inline="formData.inline" :title="formData.title" :visible.sync="formData.visible" :append-to-body="formData.appendToBody"
      :custom-class="formData.className" :close-on-click-modal="false" :width="formData.width?formData.width:'480px'">
        <div slot="title" class="dialog-header">
          <img :src="require('@img/title_deco.png')"/>
          <span class="header-title">{{ formData.title }}</span>
        </div>
        <div class="dialog-body">
          <el-row v-for="(item, index) in formData.groupData" :key="index" class="his-info-normal">
            <el-col v-for="obj in item" :key="obj.key" :span="obj.span">
              <div v-if="obj.type == 'label'">
                <div class="his-info-title">{{obj.label}}</div>
                <div class="his-info-cont">{{obj.formatter?formatter(obj.value):(obj.key=='alarmFlag'?(obj.value==null?'':(obj.value?'是':'否')):obj.value)}}</div>
              </div>
              <div v-else-if="obj.type == 'arr'">
                <div class="his-info-title">{{obj.label}}</div>
                <div class="his-info-cont his-info-arr">
                  <div v-for="(val, index) in obj.value" :key="index" class="his-info-arr-div">{{val[obj.showKey]}}</div>
                </div>
              </div>
              <div v-else-if="obj.type == 'list'" class="whole-contain">
                <div class="his-info-list-title">{{obj.label}}</div>
                <div class="his-info-table-div div-head">
                  <table class="his-info-table table-head">
                    <thead>
                      <tr class="his-info-table-thead">
                        <th  v-for="field in obj.tableField" :key="field.prop">{{field.label}}</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div class="his-info-table-div div-body">
                  <table class="his-info-table table-body">
                    <tbody>
                      <tr v-for="(item, index) in obj.value" :key="index" :class="(index % 2 == 0)?'his-info-table-tr tr-single':'his-info-table-tr tr-double'">
                        <td v-for="field in obj.tableField" :key="field.prop">
                          <div v-if="field.type == 'files'" class="file-down-div">
                            <a v-for="url in item[field.prop]" :key="url['tableKeyId']" class="a-download" :href="dfsUrl + url[field.urlKey]" :download="substr(url[field.urlKey])"><i class="el-icon-download"></i></a>
                          </div>
                          <div v-else>{{field.formatter?formatter(item[field.prop]):item[field.prop]}}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
        </div>
      </el-dialog>
    </div>
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
      // 基础路径
      baseUrl: 'taskscheduling/hisDynamicTaskRecord',
      // 分页参数
      pageData: {
        currentPage: 1,
        pageSizes: [10, 20, 30],
        pageSize: 10,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0
      },
      dfsUrl: '',
      formData: {
        title: '详情',
        visible: false,
        inline: true,
        width: '600px',
        key: 'reasonCode',
        formData: [
          {key: 'taskName', label: '任务名称', type: 'label', span: 6},
          {key: 'currState', label: '任务状态', type: 'label', span: 6},
          {key: 'execDate', label: '航班日期', type: 'label', span: 6},
          {key: 'flightNo', label: '航班号', type: 'label', span: 6},
          {key: 'distributeTime', label: '派发时间', type: 'label', formatter: true, span: 6},
          {key: 'receiveTime', label: '接受时间', type: 'label', formatter: true, span: 6},
          {key: 'beginTimeE', label: '预计开始', type: 'label', formatter: true, span: 6},
          {key: 'endTimeE', label: '预计结束', type: 'label', formatter: true, span: 6},
          {key: 'beginTimeA', label: '实际开始', type: 'label', formatter: true, span: 6},
          {key: 'endTimeA', label: '实际结束', type: 'label', formatter: true, span: 6},
          {key: 'costMinute', label: '耗时/分', type: 'label', span: 6},
          {key: 'alarmFlag', label: '是否超时', type: 'label', span: 6},
          {key: 'teamName', label: '负责班组', type: 'label', span: 24},
          {key: 'exceptions', label: '异常信息', type: 'arr', showKey: 'exceptionDesc', span: 24},
          {
            key: 'operations',
            label: '详情列表',
            type: 'list',
            span: 24,
            tableField: [
              {prop: 'operationName', label: '操作名称'},
              {prop: 'operationTime', label: '操作时间', formatter: true},
              {prop: 'empName', label: '操作人'},
              {prop: 'attachments', label: '附件', type: 'files', urlKey: 'attachmentUrl'}
            ]
          }
        ],
        groupData: []
      },
      // 查询条件每行个数
      colSize: 5,
      // 查询条件设置
      queryList: [
        {
          // 'p': '航班号',
          key: 'flightNo',
          value: '',
          toUpper: true,
          type: 'input',
          inputText: '航班号',
          span: 3
        }, {
          // 'p': '机型',
          /* key: 'aircraftIcao',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '班组',
          getOptions: '/organization/team/queryAllByUser',
          optKey: 'teamId',
          optLabel: 'teamName',
          filterKeys: ['teamId', 'teamName'],
          span: 4
        }, { */
          // 'p': '班组',
          key: 'teamName',
          value: '',
          type: 'input',
          inputText: '班组',
          span: 3
        }, {
          // 'p': '人员',
          key: 'empName',
          value: '',
          type: 'input',
          inputText: '人员',
          span: 3
        }, {
          // 'p': '航班日期',
          key: 'execDate',
          value: '',
          type: 'date',
          format: 'yyyy-MM-dd',
          valueFormat: 'yyyy-MM-dd',
          inputText: '航班日期',
          span: 3
        }, {
          // 'p': '任务',
          key: 'taskNo',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'taskNo',
          optLabel: 'taskCn',
          inputText: '任务',
          getOptions: 'taskbasic/tasks/queryAll',
          span: 3
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
        multipleSelection: [],
        fields: [
          {prop: 'taskName', label: '任务名称', fixed: true, hidden: false},
          {prop: 'execDate', label: '航班日期', fixed: false, hidden: false},
          {prop: 'flightNo', label: '航班号', fixed: false, hidden: false},
          {prop: 'currState', label: '任务状态', fixed: false, hidden: false},
          {prop: 'teamName', label: '负责班组', fixed: false, hidden: false},
          {prop: 'distributeTime', label: '派发时间', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'receiveTime', label: '接受时间', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'beginTimeE', label: '预计开始', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'endTimeE', label: '预计结束', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'beginTimeA', label: '实际开始', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'endTimeA', label: '实际结束', fixed: false, hidden: false, formatter: this.formatterMin},
          {prop: 'costMinute', label: '耗时/分', fixed: false, hidden: false},
          {prop: 'alarmFlag', label: '是否超时', fixed: false, hidden: false, optionKey: 'isZOrO', options: [{key: 1, value: '是'}, {key: 0, value: '否'}]},
          {prop: 'exception', label: '是否异常', fixed: false, hidden: false, optionKey: 'isTOrF', options: [{key: true, value: '是'}, {key: false, value: '否'}]}
        ]
      }
    }
  },
  mounted () {
    this.$store.commit('setConfigValue', 'dfsUrl')
    this.dfsUrl = this.$store.getters.getConfigValue
  },
  methods: {
    // 详情
    handleDetail (row) {
      queryAll('/taskscheduling/hisDynamicTaskRecord/queryTaskDetail', row).then(res => {
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (['exceptions', 'operations'].includes(this.formData.formData[i].key)) {
            this.$set(this.formData.formData[i], 'value', res.data.data[this.formData.formData[i].key])
          } else {
            this.$set(this.formData.formData[i], 'value', res.data.data.task[this.formData.formData[i].key])
          }
        }
        var arr = _.dropRight(this.formData.formData, 3)
        this.formData.groupData = _.chunk(arr, 4)
        arr = _.drop(this.formData.formData, this.formData.formData.length - 3)
        this.formData.groupData = _.concat(this.formData.groupData, _.chunk(arr, 1))
        this.formData.visible = true
      })
    },
    handleClose () {
      this.formData.visible = false
    },
    // 格式化 HH:MM
    formatter (value) {
      return value ? value.substr(11, 5) : ''
    },
    substr (url) {
      var arr = url.split('/')
      return arr[arr.length - 1]
    }
  }
}
</script>

<style scope>
</style>
