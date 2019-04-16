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
import { queryAll } from '../../../api/base.js'
import {twoDecimal, threeD, phoneReg, maxENReg} from '../../../util/rules.js'

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
      baseUrl: 'message/noticeTopic',
      // 查询条件每行个数
      colSize: 5,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'noticeTopicId', label: '通告ID', type: 'pInput', isHidden: true},
          {key: 'topic', label: '通告主题', type: 'input', class: 'auto-width', maxlength: 30},
          {key: 'content', label: '通告内容', type: 'textarea', class: 'auto-height auto-width', autosize: {minRows: 1, maxRows: 4}, maxlength: 100},
          {key: 'remark', label: '备注', type: 'textarea', class: 'auto-width', autosize: true, maxlength: 100}
        ],
        rules: {
          topic: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          content: [
            {required: true, message: '必填项', trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          // 'p': '通告主题',
          key: 'topic',
          value: null,
          type: 'select',
          filterable: true,
          inputText: '通告主题',
          getOptions: '/message/noticeTopic/queryNoRepeatTopic',
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
        key: 'noticeTopicId',
        multipleSelection: [],
        fields: [
          {prop: 'topic', label: '通告主题', fixed: true, hidden: false},
          {prop: 'content', label: '通告内容', fixed: false, hidden: false, overflow: true},
          {prop: 'remark', label: '备注', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    customMethod () {
      this.queryList.forEach(item => {
        if (item.key == 'topic') {
          queryAll(item.getOptions, {}).then(response => {
            if (response.data.code == 0) {
              this.$set(item, 'options', response.data.data)
            }
          })
        }
      })
    }
  }
}
</script>
