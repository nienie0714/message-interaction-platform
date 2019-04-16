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
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload">
          <template slot="button-slot-scope">
            <div v-if="permissions.defaultAll" class="tool-div-button tool-default" @click="handleDefault(null)">
              <div class="defaultall-tooltip">一键恢复默认</div>
            </div>
          </template>
        </Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit">
        <template slot="button-slot-scope" slot-scope="scopeData">
          <div v-if="permissions.default" class="tool-div-button button-default" @click="handleDefault(scopeData.data)">
            <div class="default-tooltip">恢复默认</div>
          </div>
        </template>
      </Table-view>
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
import baseMixin from '../../../components/mixin/baseMixin'
import {idReg, sevDotTwoDigit, sixDotSixDigit, degreePos} from '../../../util/rules.js'
import {queryAll, postData} from '../../../api/base.js'
import _ from 'lodash'

export default {
  components: {
    QueryView,
    PaginationView,
    TableView,
    ToolButtonView,
    EditView
  },
  mixins: [basicTableMixin, pageTableMixin, baseMixin],
  data () {
    return {
      // 菜单对应按钮权限
      permissions: {
        add: false,
        update: false,
        delete: false,
        export: false,
        default: false,
        defaultAll: false
      },
      // 基础路径
      baseUrl: 'message/aomsOperationWarning',
      // 恢复默认
      defaultUrl: 'message/aomsOperationWarning/recoverDefaultWarning',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        formData: [
          {key: 'taskNo', label: '任务编号', type: 'input', isHidden: true},
          {key: 'taskCn', label: '任务', type: 'input', disabled: true},
          {key: 'operationNo', label: '任务操作编号', type: 'input', isHidden: true},
          {key: 'operationCn', label: '任务操作', type: 'input', disabled: true},
          {key: 'warning1', label: '预警阈值1', type: 'number', position: 'right', step: 1, change: this.changeNo1},
          {key: 'warning2', label: '预警阈值2', type: 'number', position: 'right', step: 1, change: this.changeNo2},
          {key: 'warning3', label: '预警阈值3', type: 'number', position: 'right', step: 1, change: this.changeNo3},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          warning1: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          warning2: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          warning3: [
            {required: true, message: '必填项', trigger: 'change'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 4,
      // 查询条件设置
      queryList: [
        {
          // 'p': '任务'
          key: 'taskNo',
          value: '',
          type: 'select',
          filterable: true,
          inputText: '任务',
          getOptions: '/message/aomsOperationWarning/queryWarningTask',
          optKey: 'taskNo',
          optLabel: 'taskCn',
          span: 4
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        multipleSelection: [],
        fields: [
          {prop: 'taskCn', label: '任务', fixed: true, hidden: false},
          {prop: 'operationCn', label: '任务操作', fixed: false, hidden: false},
          {prop: 'warning1', label: '预警阈值1', fixed: false, hidden: false},
          {prop: 'warning2', label: '预警阈值2', fixed: false, hidden: false},
          {prop: 'warning3', label: '预警阈值3', fixed: false, hidden: false},
          {prop: 'remark', label: '备注', fixed: false, hidden: false}
        ]
      }
    }
  },
  methods: {
    customSaveBefore (data) {
      let {warning1, warning2, warning3} = data
      // 0 0 0
      if (warning1 === 0 && warning2 === 0 && warning3 === 0) {
        return data
      }
      // 6 7 8
      if (warning1 !== 0 && warning2 !== 0 && warning3 !== 0) {
        if (warning1 < warning2) {
          if (warning2 < warning3) {
            return data
          } else {
            this.showError('错误', '预警阈值 2 必须小于阈值预警 3 !')
            return null
          }
        } else {
          this.showError('错误', '预警阈值 1 必须小于阈值预警 2 !')
          return null
        }
      }
      if (warning1 <= warning2 && warning2 <= warning3) {
        // 7 7 x
        if (warning1 !== 0 && warning1 == warning2) {
          this.showError('错误', '预警阈值 1 必须小于阈值预警 2 !')
          return null
        } else if (warning1 == 0 && warning2 == 0 && warning3 >= 0) {
          return data
        }
        // x 7 7
        if (warning2 !== 0 && warning2 == warning3) {
          this.showError('错误', '预警阈值 2 必须小于阈值预警 3 !')
          return null
        }
        if (warning3 <= warning1) {
          this.showError('错误', `预警阈值 3 必须大于预警阈值 2，且预警阈值 2 必须大于预警阈值 1`)
          return null
        }
      }
      if (warning2 <= warning1) {
        if (warning2 >= warning3) {
          if (warning3 >= warning1) {
            this.showError('错误', `预警阈值 2 必须在 ${warning1} 和 ${warning3} 之间!`)
            return null
          } else {
            this.showError('错误', `预警阈值 3 必须大于预警阈值 2，且预警阈值 2 必须大于预警阈值 1`)
            return null
          }
        } else {
          this.showError('错误', '预警阈值 1 必须小于阈值预警 2 !')
          return null
        }
      }
      return data
    },
    handleDefault (row) {
      var data = []
      if (row) {
        let {taskNo, operationNo, ...rest} = row
        data.push({taskNo, operationNo})
      } else {
        data = this.tableData.data
      }
      postData(this.defaultUrl, data).then(res => {
        if (res.data.code == 0) {
          this.showSuccess(`${row ? '' : '一键'}恢复默认`)
          this.queryDataReq()
        } else {
          this.showError(`${row ? '' : '一键'}恢复默认`, '请联系管理员 !')
        }
      })
    }
  }
}
</script>

<style>
.tool-default>.defaultall-tooltip {
  color: transparent;
}
.tool-default:hover>.defaultall-tooltip {
    line-height: 26px;
    position: absolute;
    top: 33px;
    right: -28px;
    width: 76px;
    padding-left: 5px;
    height: 26px;
    border-radius: 10px;
    background-color: #19526c;
    color: cadetblue;
    font-size: 12px;
    border: 1px solid #0d2230;
}
.page-table-view>.el-table .button-default>.default-tooltip {
  color: transparent;
}
.page-table-view>.el-table .button-default:hover>.default-tooltip {
    line-height: 14px;
    position: absolute;
    top: 24px;
    right: 3px;
    padding: 0;
    border-radius: 4px;
    background-color: #19526c;
    color: cadetblue;
    font-size: 8px;
    border: 1px solid #447385;
}
</style>
