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
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit">
      <template slot="slot-scope" slot-scope="scopeTemp">
        <div v-if="scopeTemp.item.slotType=='textArea'" class="text-area-sql">
          <div class="div-label-div"><div class="label-div">{{scopeTemp.data['inOutType']}}</div></div>
          <div>
            <div v-for="(item, index) in scopeTemp.data[scopeTemp.item.key]" :key="index" :class="((formData.title!='详情')?'cond-sql-div div-pointer':'cond-sql-div')+((scopeTemp.item.clickIndex==index)?' sql-div-click':'')" @click="(formData.title!='详情')&&clickCondSql(scopeTemp, index)">{{item}}  </div>
          </div>
          <div class="label-button">
            <el-button @click="(formData.title!='详情')&&deleteCondSql(scopeTemp)" :class="(formData.title!='详情')?'font-bold':'font-bold div-disabled'">←</el-button>
            <el-button @click="(formData.title!='详情')&&deleteAllCondSql(scopeTemp)" :class="(formData.title!='详情')?'font-bold div-button-clear':'font-bold div-button-clear div-disabled'">清 空</el-button>
          </div>
        </div>
        <div v-if="scopeTemp.item.slotType=='divButton'" class="div-buttons">
          <div v-for="item in scopeTemp.item.options" :key="item" :class="(formData.title!='详情')?'div-button':'div-button div-disabled'" @click="(formData.title!='详情')&&clickSqlKey(scopeTemp, item)">{{item}}</div>
        </div>
      </template>
    </Edit-view>
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
import {idReg, threeD} from '../../../util/rules.js'
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
      baseUrl: 'taskbasic/processDef',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'processNo',
        formData: [
          {key: 'processNo', label: '流程编号', type: 'input', maxlength: 20},
          {key: 'processCn', label: '流程名称', type: 'input', maxlength: 20},
          {key: 'isLate', label: '是否晚到', type: 'tabs', tabsKey: 'isYOrN', options: []},
          {key: 'inOutType', label: '适用流程的SQL', type: 'tabs', class: 'auto-width', tabsKey: 'inOutType', options: []},
          {key: 'reserved1List', label: '表达式拼接', type: 'slot', clickIndex: null, slotType: 'textArea', class: 'auto-width'},
          {
            key: 'select',
            label: '条件',
            class: 'auto-width margin-bottom-slow',
            type: 'slot',
            clickKey: 'reserved1List',
            slotType: 'divButton',
            options: ['and', 'nvl(', 'round(', '(', ')', '-', '<', '>', '<=', '>=', '=', '*', ',']
          },
          {key: 'code1', label: '参数一', class: 'auto-width margin-bottom-slow', type: 'slot', slotType: 'divButton', clickKey: 'reserved1List', getOptions: '/taskbasic/processDef/listParams', options: []},
          {
            key: 'code2',
            label: '参数二',
            class: 'auto-width margin-bottom-slow',
            type: 'slot',
            clickKey: 'reserved1List',
            slotType: 'divButton',
            options: [1440, 30, 35, 40, 45, 50, 55, 60]
          }
        ],
        rules: {
          processNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          processCn: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          inOutType: [
            {required: true, message: '必填项', trigger: 'change'}
          ],
          reserved1List: [
            {required: true, message: '必填项', trigger: 'change'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 5,
      // 查询条件设置
      queryList: [
        {
          // 'p': '流程名称',
          key: 'processCn',
          value: '',
          type: 'input',
          inputText: '流程名称',
          span: 4
        }, {
          // 'p': '进出港类型',
          key: 'inOutType',
          tabsKey: 'inOutType',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'span': 5
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
        key: 'processNo',
        multipleSelection: [],
        fields: [
          {prop: 'processNo', label: '流程编号', fixed: true, hidden: false},
          {prop: 'processCn', label: '流程名称', fixed: false, hidden: false},
          {prop: 'inOutType', label: '进出港类型', fixed: false, hidden: false, optionKey: 'inOutType', width: '100'},
          {prop: 'reserved1', label: '使用流程的SQL', fixed: false, hidden: false, width: '700'},
          {prop: 'isLate', label: '是否晚到', fixed: false, hidden: false, optionKey: 'isYOrN', width: '100'}
        ]
      }
    }
  },
  methods: {
    clickCondSql (scopeTemp, index) {
      if (scopeTemp.item.clickIndex == index) {
        scopeTemp.item.clickIndex = null
      } else {
        scopeTemp.item.clickIndex = index
      }
    },
    deleteCondSql (scopeTemp) {
      if ((scopeTemp.item.clickIndex != null) && (scopeTemp.item.clickIndex >= 0)) {
        scopeTemp.data[scopeTemp.item.key].splice(scopeTemp.item.clickIndex, 1)
        if (scopeTemp.item.clickIndex == 0) {
          if ((scopeTemp.data[scopeTemp.item.key] == null) || (scopeTemp.data[scopeTemp.item.key].length == 0)) {
            scopeTemp.item.clickIndex = null
          }
        } else {
          scopeTemp.item.clickIndex = scopeTemp.item.clickIndex - 1
        }
      } else {
        scopeTemp.data[scopeTemp.item.key].pop()
      }
      this.$refs.basicTable.$parent.$parent.$children[2].$refs['ruleForm'].validateField(scopeTemp.item.key)
    },
    deleteAllCondSql (scopeTemp) {
      this.$set(scopeTemp.data, scopeTemp.item.key, [])
      this.$refs.basicTable.$parent.$parent.$children[2].$refs['ruleForm'].validateField(scopeTemp.item.key)
    },
    clickSqlKey (scopeTemp, item) {
      if ((this.formData.formData[4].clickIndex != null) && (this.formData.formData[4].clickIndex >= 0)) {
        scopeTemp.data[scopeTemp.item.clickKey].splice(this.formData.formData[4].clickIndex + 1, 0, item)
        this.formData.formData[4].clickIndex = this.formData.formData[4].clickIndex + 1
      } else {
        scopeTemp.data[scopeTemp.item.clickKey].push(item)
      }
      this.$refs.basicTable.$parent.$parent.$children[2].$refs['ruleForm'].validateField(scopeTemp.item.clickKey)
    },
    // 新增
    handleAdd () {
      this.formData.formData[4].clickIndex = null
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].slotType == 'textArea') {
          this.formData.formData[i].clickIndex = null
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        if (this.formData.formData[i].slotType == 'textArea') {
          this.formData.formData[i].clickIndex = null
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    }
  }
}
</script>

<style scoped>
.text-area-sql {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(60, 166, 200, 0.7);
  box-shadow: 0 0 10px rgba(60, 166, 200, 0.3);
  border-radius: 12px;
  height: 120px;
  padding: 10px;
  margin-bottom: 3px;
}
.dialog-form-edit .el-dialog .el-dialog__body .el-form-item.is-error .text-area-sql {
  border-color: #e65069 !important;
}
.div-label-div {
  float: left;
  height: 100%;
}
.label-div {
  color: #fff;
  background-color: rgba(60, 166, 200, 0.4);
  font-size: 14px;
  height: 14px;
  line-height: 14px;
  padding: 8px;
  border-radius: 8px;
  margin-right: 10px;
}
.cond-sql-div {
  float: left;
  color: #fff;
  font-size: 16px;
  padding: 6px 2px;
  height: 16px;
  line-height: 16px;
  border-radius: 6px;
}
.sql-div-click {
  background-color: rgb(60, 166, 200);
}
.label-button {
  top: calc(100% - 11px - 32px);
  position: absolute;
  right: 10px;
  height: 32px;
}
.label-button>div {
  display: flex;
  height: 30px;
}
.font-bold {
  font-weight: bold;
}
.div-buttons {
  display: flex;
  flex-wrap: wrap;
}
.div-buttons>div {
  padding: 0 8px;
  color: #fff;
  margin-bottom: 10px;
}
.div-buttons>div:not(:last-of-type) {
  margin-right: 10px;
}
.div-button-clear {
  background-color: rgba(230, 80, 105, 0.4) !important;
  border-color: #e55069 !important;
  box-shadow: 0 0 10px rgba(230, 80, 105, 0.4) inset;
}
</style>
