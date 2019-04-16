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
        <div class="pro-task-opr-div-com pro-tasks-opr-div">
          <div class="task-pro-div">
            <div class="task-div-header">关联操作<div class="add-button"><div :class="((formData.title!='详情')&&(!scopeTemp.item.editIndex)&&(scopeTemp.item.editIndex!=0))?'tool-div-button tool-add':'tool-div-button tool-add div-disabled'" @click="((formData.title!='详情')&&(!scopeTemp.item.editIndex)&&(scopeTemp.item.editIndex!=0))&&addOpr(scopeTemp)"></div></div></div>
            <div class="task-div-tasks-list">
              <div class="task-pro-cont-table-div div-head">
                <table cellpadding="0" cellspacing="0" class="task-pro-cont-table table-head">
                  <thead>
                    <tr class="task-pro-cont-table-thead tr-single">
                      <th v-for="(item, index) in scopeTemp.item.tabelFields" :key="index" :width="item.width">{{item.label}}</th>
                      <th></th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="task-pro-cont-table-div div-body">
                <table cellpadding="0" cellspacing="0" class="task-pro-cont-table table-body">
                  <tbody>
                    <tr v-for="(item, index) in scopeTemp.data[scopeTemp.item.key]" :key="index" :class="(index % 2 > 0)?'task-pro-cont-table-tr tr-single':'task-pro-cont-table-tr tr-double'">
                      <div v-if="scopeTemp.item.editIndex == index" class="tr-div-td">
                        <td v-for="field in scopeTemp.item.tabelFields" :key="field.prop" class="cont-tr-div" :width="field.width">
                          <div class="td-edit-div">
                            <span v-if="(field.prop=='operationNo')&&(scopeTemp.item.editType=='update')" class="span-label">{{item[field.prop]?item[field.prop]:''}}</span>
                            <el-input v-else-if="field.prop=='operationNo'" :type="field.type" v-model.trim.lazy="item[field.prop]" :placeholder="field.label" auto-complete="off" :maxlength="field.maxlength"></el-input>
                            <el-input v-else-if="field.type == 'input'" :type="field.type" v-model.trim.lazy="item[field.prop]" :placeholder="field.label" auto-complete="off" :maxlength="field.maxlength"></el-input>
                            <el-input v-else-if="field.type == 'number'" :type="field.type" v-model.trim.lazy="item[field.prop]" :placeholder="field.label" auto-complete="off" :min="field.min" :max="field.max"></el-input>
                          </div>
                        </td>
                        <td class="cont-tr-div table-opt-col">
                          <div :class="item[scopeTemp.item.fieldsKey]?'tool-div-button opr-edit-save':'tool-div-button opr-edit-save div-disabled'" @click="item[scopeTemp.item.fieldsKey]&&saveOpr(scopeTemp, item, index)"></div>
                          <div class="tool-div-button opr-edit-cancel" @click="cancelOpr(scopeTemp, index)"></div>
                        </td>
                      </div>
                      <div v-else class="tr-div-td">
                        <td v-for="field in scopeTemp.item.tabelFields" :key="field.prop" class="cont-tr-div" :width="field.width">
                          <div v-if="['isMilestone', 'isActive'].includes(field.prop)">{{item[field.prop]=='Y'?'是':(item[field.prop]=='N'?'否':'')}}</div>
                          <div v-else>{{item[field.prop]?item[field.prop]:' '}}</div>
                        </td>
                        <td class="cont-tr-div table-opt-col">
                        <div :class="(formData.title!='详情')?'tool-div-button button-edit':'tool-div-button button-edit div-disabled'" @click="(formData.title!='详情')&&editOpr(scopeTemp, item, index)"></div>
                          <div :class="(formData.title!='详情')?'tool-div-button button-delete':'tool-div-button button-delete div-disabled'" @click="(formData.title!='详情')&&deleteOpr(scopeTemp, item, index)"></div>
                        </td>
                      </div>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Warning-box-view :data="scopeTemp.item.deleteData" @handleConfirm="handleOprDeleteConfirm(scopeTemp)"></Warning-box-view>
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
import {postData, queryAll} from '../../../api/base.js'
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
      baseUrl: 'taskbasic/tasks',
      // 获取编辑/详情页面任务关联操作路径
      getEditDataUrl: '/taskbasic/taskOperations/queryAll',
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        width: '600px',
        className: 'twiceCol',
        key: 'taskNo',
        formData: [
          {key: 'taskNo', label: '任务编号', type: 'input', maxlength: 20},
          {key: 'taskType', label: '任务类型', type: 'tabs', tabsKey: 'taskType'},
          {key: 'taskCn', label: '任务名称', type: 'input', maxlength: 50},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {
            key: 'operations',
            label: '',
            type: 'slot',
            class: 'whole-width',
            unClick: false,
            editIndex: null,
            editType: null,
            deleteType: 'deleteOne',
            rowKey: 'taskNo',
            fieldsKey: 'operationNo',
            basicUrl: 'taskbasic/taskOperations/',
            tabelFields: [
              {prop: 'operationNo', label: '操作编号', width: '150', type: 'input', maxlength: 20, required: true},
              {prop: 'operationCn', label: '操作名称', width: '200', type: 'input', maxlength: 20, required: true},
              {prop: 'sortkey', label: '排序码', width: '92', type: 'number', min: 0, max: 999}
            ],
            tempData: {},
            deleteData: {
              visible: false,
              loading: false,
              width: '500px',
              url: '',
              index: null,
              class: ' dialog-delete-warn',
              info: '确认要删除所选数据吗？',
              data: null
            }
          }/* {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100} */
        ],
        rules: {
          taskNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: idReg, trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          taskCn: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          taskType: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件每行个数
      colSize: 5,
      // 查询条件设置
      queryList: [
        {
          // 'p': '任务名称',
          key: 'taskCn',
          value: '',
          type: 'input',
          inputText: '任务名称',
          span: 4
        }, {
          // p: '任务类型',
          key: 'taskType',
          tabsKey: 'taskType',
          value: null,
          type: 'tabs',
          size: 'medium',
          inputText: '',
          options: [{
            key: null,
            value: '全部'
          }],
          'valueChange': 'attrChange',
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
        key: 'taskNo',
        multipleSelection: [],
        fields: [
          {prop: 'taskNo', label: '任务编号', fixed: true, hidden: false},
          {prop: 'taskCn', label: '任务名称', fixed: false, hidden: false},
          {prop: 'taskType', label: '任务类型', fixed: false, hidden: false, optionKey: 'taskType'}
        ]
      }
    }
  },
  methods: {
    oprReg (value) {
      if (value != '' && value != null) {
        let reg = /^[A-Z0-9-_/]{1,20}$/
        if (!reg.test(value)) {
          return '必须由数字、大写字母或-_/组成'
        } else {
          return false
        }
      } else {
        return false
      }
    },
    addOpr (scopeTemp) {
      this.tempData = {}
      var obj = {}
      scopeTemp.item.tabelFields.forEach(field => {
        this.$set(obj, field.prop, null)
      })
      scopeTemp.data[scopeTemp.item.key].push(obj)
      scopeTemp.item.editIndex = scopeTemp.data[scopeTemp.item.key].length - 1
      scopeTemp.item.editType = 'save'
      var element = document.getElementsByClassName('task-pro-cont-table-tr')
      if (element.length) {
        element[element.length - 1].scrollIntoView(false)
      }
    },
    editOpr (scopeTemp, item, index) {
      scopeTemp.item.editIndex = index
      scopeTemp.item.editType = 'update'
      this.tempData = JSON.parse(JSON.stringify(item))
      /* for (var i = 0; i < this.formData.formData[4].tabelFields.length; i++) {
        if (this.formData.formData[4].tabelFields[i].hasOwnProperty('saveKey')) {
          this.$set(this.tempData, this.formData.formData[4].tabelFields[i].editProp, scopeTemp.data[scopeTemp.item.key][index][this.formData.formData[4].tabelFields[i].editProp])
        }
      } */
    },
    deleteOpr (scopeTemp, item, index) {
      scopeTemp.item.deleteData.index = index
      scopeTemp.item.deleteData.data = item
      scopeTemp.item.deleteData.url = scopeTemp.item.basicUrl + scopeTemp.item.deleteType
      scopeTemp.item.deleteData.visible = true
    },
    handleOprDeleteConfirm (scopeTemp) {
      postData(scopeTemp.item.deleteData.url, scopeTemp.item.deleteData.data).then(response => {
        if (response.data.code == 0) {
          this.showSuccess('操作删除')
          scopeTemp.data[scopeTemp.item.key].splice(scopeTemp.item.deleteData.index, 1)
          scopeTemp.item.deleteData.visible = false
        } else {
          this.showError('操作删除')
        }
      })
    },
    saveOpr (scopeTemp, item, index) {
      var result = this.oprReg(item[scopeTemp.item.fieldsKey])
      if (result) {
        this.showError('保存', '操作编号' + result)
      } else {
        _.forEach(scopeTemp.item.tabelFields, (value) => {
          if (value.hasOwnProperty('required') && value.required) {
            if (!item[value.prop]) {
              result = true
              this.showError('保存', value.label + '不能为空')
            }
          }
        })
        if (!result) {
          result = this.oprSortkeyReg(item.sortkey)
          if (result) {
            this.showError('保存', '排序码' + result)
          } else {
            if (scopeTemp.item.editType == 'update') {
              var data = item
              this.$set(data, scopeTemp.item.rowKey, scopeTemp.data[scopeTemp.item.rowKey])
              postData(scopeTemp.item.basicUrl + scopeTemp.item.editType, data).then(response => {
                if (response.data.code == 0) {
                  this.showSuccess('操作保存')
                  this.tempData = {}
                  scopeTemp.item.editIndex = null
                  scopeTemp.item.editType = null
                } else {
                  this.showError('操作保存')
                }
              })
            } else {
              var obj = {}
              this.$set(obj, scopeTemp.item.fieldsKey, item[scopeTemp.item.fieldsKey])
              postData(scopeTemp.item.basicUrl + 'checkExist', obj).then(response => {
                if (response.data.code == 0 && response.data.data.hasOwnProperty('exist')) {
                  if (response.data.data.exist > 0) {
                    this.showError('保存', '当前操作编号已存在')
                  } else {
                    var data = item
                    this.$set(data, scopeTemp.item.rowKey, scopeTemp.data[scopeTemp.item.rowKey])
                    postData(scopeTemp.item.basicUrl + scopeTemp.item.editType, data).then(response => {
                      if (response.data.code == 0) {
                        this.showSuccess('操作保存')
                        this.tempData = {}
                        scopeTemp.item.editIndex = null
                        scopeTemp.item.editType = null
                      } else {
                        this.showError('操作保存')
                      }
                    })
                  }
                } else {
                  this.showError('请求')
                }
              })
            }
          }
        }
      }
    },
    cancelOpr (scopeTemp, index) {
      if (!this.tempData || !this.tempData.hasOwnProperty(scopeTemp.item.fieldsKey) || !this.tempData[scopeTemp.item.fieldsKey]) {
        this.$delete(scopeTemp.data[scopeTemp.item.key], index)
      } else {
        this.$set(scopeTemp.data[scopeTemp.item.key], index, this.tempData)
      }
      scopeTemp.item.editIndex = null
      scopeTemp.item.editType = null
    },
    // 新增/编辑前操作
    customSaveBefore (data) {
      var obj = JSON.parse(JSON.stringify(data))
      this.$delete(obj, 'operations')
      return obj
    },
    // 新增
    handleAdd () {
      this.$set(this.formData.formData[4], 'isHidden', true)
      this.formData.formData[4].unClick = false
      this.formData.formData[4].editIndex = null
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      queryAll(this.getEditDataUrl, {taskNo: row.taskNo}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].type != 'slot') {
              this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data)
              this.$set(this.formData.formData[i], 'isHidden', false)
              this.formData.formData[i].unClick = true
              this.formData.formData[i].editIndex = null
            }
          }
          this.formData.title = '详情'
          this.formData.visible = true
        }
      })
    },
    // 编辑
    handleEdit (row) {
      queryAll(this.getEditDataUrl, {taskNo: row.taskNo}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].type != 'slot') {
              this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data)
              this.$set(this.formData.formData[i], 'isHidden', false)
              this.formData.formData[i].unClick = false
              this.formData.formData[i].editIndex = null
            }
          }
          this.formData.title = '编辑'
          this.formData.visible = true
        }
      })
    }
  }
}
</script>

<style scoped>
.page-table-view .pro-task-div {
  white-space: nowrap;
  overflow: hidden;
  /* text-overflow: ellipsis; */
  height: 28px;
  margin: 4px 10px 4px 0;
  padding: 7px 10px;
  border-radius: 6px;
  box-sizing: border-box;
  cursor: pointer;
}
.page-table-view .pro-task-opr-div-row .task-active {
  border: none;
  background-color: rgba(3, 167, 134, 0.6);
  line-height: 14px;
}
.page-table-view .pro-task-opr-div-row .task-dis-active {
  border: 1px solid rgba(122, 147, 158, 0.6);
  line-height: 12px;
}
.pro-task-opr-pop .el-header {
  height: 40px !important;
  line-height: 16px;
  font-size: 16px;
  padding: 12px;
}
.pro-task-opr-pop .el-header>div:not(:last-of-type) {
  float: left;
}
.pro-task-opr-pop .el-header>div:last-of-type {
  float: right;
}
.pro-task-opr-pop .font-white {
  color: #fff;
}
.pro-task-opr-pop .font-green {
  color: #03a786;
}
.pro-task-opr-pop .font-gray {
  color: #7a939e;
  margin-left: 10px;
}
.pro-task-opr-pop .pro-task-div,
.pro-task-opr-div {
  display: flex;
}
.pro-task-opr-row-div {
  padding: 8px 12px 12px 12px;
}
.pro-task-opr-div>div {
  background-color: rgba(122, 147, 158, 0.4);
  border-radius: 14px;
  color: #fff;
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  padding: 7px 14px;
}
.pro-task-opr-div>div:not(:last-of-type),
.pro-task-opr-div.el-popover__reference {
  margin-right: 10px;
}
.pro-task-opr-div.el-popover__reference {
  cursor: pointer;
}
.pro-task-opr-div.el-popover__reference>div:hover {
  background-color: rgba(54, 141, 178, 0.4);
}
.pro-task-opr-div-com {
  display: flex;
}
.pro-tasks-opr-div {
  height: calc(100vh - 338px);
}
.pro-task-opr-div-com>div {
  border: 1px solid rgba(60,166, 200, 0.6);
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 30px rgba(60, 166, 200, 0.3) inset;
  border-radius: 12px;
}
.pro-task-opr-div-com .task-pro-div {
  flex-grow: 1;
  padding: 0 0 10px 0;
}
.pro-task-opr-div-com .task-pro-div .add-button {
  float: right;
  width: 30px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pro-task-opr-div-com .task-pro-div .add-button .tool-div-button {
  width: 30px;
  height: 30px;
  border: 1px solid #447385;
  border-radius: 6px;
  box-sizing: content-box;
  cursor: pointer;
  background-position: center;
}
.pro-task-opr-div-com .task-div-header {
  font-size: 16px;
  color: #7a939e;
}
.pro-tasks-opr-div .task-div-header {
  height: 50px;
  line-height: 50px;
}
.pro-task-opr-div-com .task-pro-div .task-div-header {
  padding: 0 20px;
}
.pro-task-opr-div-com .task-div-tasks-list {
  overflow: hidden;
}
.pro-task-opr-div-com .task-div-tasks-list .div-body.task-pro-cont-table-div {
  overflow-x: hidden;
  height: calc(100% - 44px);
}
.pro-tasks-opr-div .task-div-tasks-list {
  height: calc(100% - 50px);
}
.pro-task-opr-div-com .task-pro-div .task-pro-task {
  padding: 0 10px 16px 20px;
}
.pro-task-opr-div-com .task-pro-div .task-pro-task.task-single {
  background-color: rgba(60,166,200,0.1);
}
.task-pro-task .task-pro-head {
  height: 40px;
}
.task-pro-task .task-pro-cont {
  margin: 4px 0 0 0;
  display: flex;
  flex-wrap: wrap;
}
.task-pro-task .task-pro-head .head-left,
.task-pro-task .task-pro-head .head-right {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.task-pro-task .task-pro-head .head-left {
  float: left;
  font-size: 16px;
}
.task-pro-task .task-pro-head .head-right {
  float: right;
  font-size: 14px;
}
.task-pro-task .task-pro-head .head-left .task-cn {
  color: #4ccfff;
  margin: 0 10px 0 0;
}
.task-pro-task .task-pro-head .head-left .task-type {
  color: #7a939e;
}
.task-pro-task .task-pro-head .head-right .label {
  color: #7a939e;
  margin: 0 10px 0 0;
}
.task-pro-task .task-pro-head .head-right .switch {
  margin: 0 20px 0 0;
}
.pro-task-opr-cont-pop {
  display: flex;
  padding: 12px;
}
.pro-task-opr-cont-pop .cont-label {
  font-size: 14px;
  color: #7a939e;
  height: 14px;
  margin-bottom: 12px;
}
.pro-task-opr-cont-pop .cont-cont {
  font-size: 16px;
  color: #fff;
  height: 16px;
  word-wrap: break-word;
}
.temp-pro-task-dialog {
  height: 610px;
  width: 870px;
}
.temp-pro-task-dialog .el-form-item__content {
  height: 16px !important;
  line-height: 16px;
}
.task-pro-cont-table-thead {
  height: 44px;
  color: #7a939e;
}
.task-pro-cont-table {
  width: 100%;
}
.task-pro-cont-table-tr {
  height: 44px;
  color: #fff;
}
.task-pro-cont-table-tr .cont-tr-div {
  float: left;
}
.task-pro-cont-table tr>th {
  text-align: left;
}
.task-pro-cont-table tr>th:first-of-type,
.task-pro-cont-table tr>.tr-div-td>td:first-of-type {
  padding-left: 20px;
}
.cont-tr-div {
  display: flex;
  justify-content: left;
}
.cont-tr-div>div {
  height: 44px;
  line-height: 44px;
  overflow: hidden;
  white-space: nowrap;
}
.table-opt-col {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
}
.task-pro-cont-table-div .table-opt-col {
  padding-left: 10px;
}
.td-edit-div {
  margin-right: 10px;
}
.td-edit-div input {
  border-radius: 6px;
}
</style>
