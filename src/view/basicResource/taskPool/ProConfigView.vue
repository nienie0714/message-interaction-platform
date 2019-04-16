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
        <template slot="slot-scope" slot-scope="scope">
          <div class="pro-task-opr-div-row">
            <el-popover v-for="(item, index) in scope.row[scope.field.prop]" :key="index" placement="top" trigger="click">
              <div class="pro-task-opr-pop">
                <el-header>
                  <div class="font-white">{{item.taskCn}}</div>
                  <div class="font-gray">{{getCol(item.taskType)}}</div>
                  <div :class="item.isActive=='Y'?'font-green':'font-gray'">{{item.isActive=='Y'?'已激活':'未激活'}}</div>
                </el-header>
                <el-main>
                  <div class="pro-task-opr-div pro-task-opr-row-div">
                    <div v-for="(pop, index) in showPopData" :key="index">{{pop.operationCn}}</div>
                  </div>
                </el-main>
              </div>
              <div slot="reference">
                <div :class="item.isActive=='Y'?'pro-task-div task-active':'pro-task-div task-dis-active'" @click="clickDiv(scope.row, index)">{{item.taskCn}}</div>
              </div>
            </el-popover>
          </div>
        </template>
      </Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit">
      <template slot="slot-scope" slot-scope="scope">
        <div class="pro-task-opr-div-com pro-tasks-opr-div">
          <div class="task-pool-div">
            <div class="task-div-header">任务池</div>
            <div class="task-div-tasks-list">
              <div v-for="(item, index) in scope.item.options" :key="item[scope.item.itemKey]"
              :class="scope.item.unClick?'task-pool-task div-disabled':'task-pool-task'"
              @click="!scope.item.unClick&&addTask(scope, index)"><div class="button-font">{{item[scope.item.itemLabel]}}</div><div :class="`${scope.item.unClick?'':'button-add'} button-icon`"></div></div>
            </div>
          </div>
          <div class="task-pro-div">
            <div class="task-div-header">关联任务</div>
            <div class="task-div-tasks-list">
              <div v-for="(item, index) in scope.data[scope.item.key]" :key="index" :class="(index % 2 == 0)?'task-pro-task task-single':'task-pro-task task-double'">
                <div class="task-pro-head">
                  <div class="head-left">
                    <div class="task-cn">{{item.taskCn}}</div>
                    <div class="task-type">{{getCol(item.taskType)}}</div>
                  </div>
                  <div class="head-right">
                    <div class="label">是否激活</div>
                    <div class="switch">
                      <el-switch v-model="item.isActive" active-value="Y" inactive-value="N" :disabled="scope.item.unClick"></el-switch>
                    </div>
                    <div class="table-opt-col">
                      <div :class="scope.item.unClick?'tool-div-button button-edit div-disabled':'tool-div-button button-edit'" @click="!scope.item.unClick&&editTask(scope, index)"></div>
                      <div :class="scope.item.unClick?'tool-div-button button-delete div-disabled':'tool-div-button button-delete'" @click="!scope.item.unClick&&deleteTask(scope, index)"></div>
                      <div :class="scope.item.unClick?'tool-div-button button-up-2 div-disabled':'tool-div-button button-up-2'" @click="!scope.item.unClick&&upTask(scope, index)"></div>
                    </div>
                  </div>
                </div>
                <div class="task-pro-cont">
                  <el-popover v-for="(opr, index) in item.operations" :key="index" popper-class="task-pro-cont-pop" placement="top" trigger="click">
                    <el-row :gutter="20" class="pro-task-opr-cont-pop">
                      <el-col :span="5">
                        <div class="cont-label">参考节点</div>
                        <div class="cont-cont">{{opr.refNodeCn}}</div>
                      </el-col>
                      <el-col :span="6">
                        <div class="cont-label">参考时间偏移</div>
                        <div class="cont-cont">{{opr.refTimeOffset}}</div>
                      </el-col>
                      <el-col :span="5">
                        <div class="cont-label">更新节点</div>
                        <div class="cont-cont">{{opr.updNodeCn}}</div>
                      </el-col>
                      <el-col :span="8">
                        <div class="cont-label">更新任务时间类型</div>
                        <div class="cont-cont">{{opr.taskTimeType=='B'?'开始':(opr.taskTimeType=='E'?'结束':'')}}</div>
                      </el-col>
                    </el-row>
                    <div slot="reference" class="pro-task-opr-div">
                      <div>{{opr.operationCn}}</div>
                    </div>
                  </el-popover>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Edit-view :formData="tempProTaskDialog" @handleOther="handleTempSave(scope)" @handleOtherCancle="handleTempCancle(scope)">
          <template slot="slot-scope" slot-scope="scopeTemp">
            <div class="pro-task-opr-div-com pro-task-oprs-div">
              <div class="task-pool-div">
                <div class="task-div-header">操作池</div>
                <div class="task-div-tasks-list">
                  <div v-for="(item, index) in scopeTemp.item.options" :key="item[scopeTemp.item.itemKey]"
                  class="task-pool-task" @click="addOpr(scopeTemp, index)">
                    <div class="button-font">{{item[scopeTemp.item.itemLabel]}}</div>
                    <div class="button-add button-icon"></div>
                  </div>
                </div>
              </div>
              <div class="task-pro-div">
                <div class="task-div-header">关联操作</div>
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
                                <span v-if="field.type == 'span'" class="span-label">{{item[field.prop]?item[field.prop]:''}}</span>
                                <el-select v-else-if="field.type == 'select'" v-model="item[field.editProp]" :placeholder="field.label" @change="itemChangeHandle(item, field, field.change)"
                                :filterable="field.filterable" :clearable="field.clearable" :default-first-option="field.filterable" :value-key="field.valueKey">
                                  <el-option v-for="option in field.options" :key="option[field.itemKey]" :label="option[field.itemLabel]" :value="field.hasOwnProperty('valueKey') ? option : option[field.itemKey]">
                                    <span style="float: left">{{ option[field.itemLabel] }}</span>
                                    <span v-if="field.hasOwnProperty('itemLabelSpan')" style="float: right; color: #8492a6; font-size: 13px">{{ option[field.itemLabelSpan] }}</span>
                                  </el-option>
                                </el-select>
                                <el-select v-else-if="field.type == 'tabs'" v-model="item[field.prop]" :placeholder="field.label" @change="itemChangeHandle(item, field, field.change)"
                                :filterable="field.filterable" :clearable="field.clearable" :default-first-option="field.filterable">
                                  <el-option v-for="option in field.options" :key="option[field.itemKey]" :label="option[field.itemLabel]" :value="option[field.itemKey]">
                                    <span style="float: left">{{ option[field.itemLabel] }}</span>
                                    <span v-if="field.hasOwnProperty('itemLabelSpan')" style="float: right; color: #8492a6; font-size: 13px">{{ option[field.itemLabelSpan] }}</span>
                                  </el-option>
                                </el-select>
                                <el-input v-else-if="field.type == 'input'" v-model.trim.lazy="item[field.prop]" :placeholder="field.label" auto-complete="off" :maxlength="field.maxlength"></el-input>
                              </div>
                            </td>
                            <td class="cont-tr-div table-opt-col">
                              <div class="tool-div-button opr-edit-save" @click="saveOpr(scopeTemp, item, index)"></div>
                              <div class="tool-div-button opr-edit-cancel" @click="cancelOpr(scopeTemp, index)"></div>
                            </td>
                          </div>
                          <div v-else class="tr-div-td">
                            <td v-for="field in scopeTemp.item.tabelFields" :key="field.prop" class="cont-tr-div" :width="field.width">
                              <div v-if="field.prop=='taskTimeType'">{{item[field.prop]=='B'?'开始':(item[field.prop]=='E'?'结束':'')}}</div>
                              <div v-else>{{item[field.prop]?item[field.prop]:' '}}</div>
                            </td>
                            <td class="cont-tr-div table-opt-col">
                              <div class="tool-div-button button-edit" @click="editOpr(scopeTemp, index)"></div>
                              <div class="tool-div-button button-delete" @click="deleteOpr(scopeTemp, index)"></div>
                              <div class="tool-div-button button-up-2" @click="upOpr(scopeTemp, index)"></div>
                            </td>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Edit-view>
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
import basicMsgMixin from '../../../components/mixin/basicMsgMixin'
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
      baseUrl: 'taskbasic/processTask',
      // 请求路径
      queryUrl: 'taskbasic/processTask/queryProcessTask',
      // 新增路径
      addUrl: 'taskbasic/processTask/addProcessTask',
      // 编辑路径
      editUrl: 'taskbasic/processTask/addProcessTask',
      // 删除路径
      deleteUrl: 'taskbasic/processTask/delProcessRelation',
      // 编辑获取数据路径
      getEditDataUrl: '/taskbasic/processTask/editProcessTask',
      // 分页参数
      pageData: {
        currentPage: 1,
        pageSizes: [50, 100, 200],
        pageSize: 50,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0
      },
      formData: {
        title: '新增',
        visible: false,
        width: '1000px',
        inline: true,
        className: 'twiceCol',
        key: 'processNo',
        formData: [
          {key: 'processCn', label: '航班流程', type: 'pInput', isHidden: true},
          {key: 'processNo', label: '航班流程', type: 'select', filterable: true, clearable: true, getOptions: '/taskbasic/processTask/queryNoRelatedTaskProcess', valueKey: 'processNo', itemKey: 'processNo', itemLabel: 'processCn', change: this.changeNo},
          {key: 'proTasksTemp', label: '', type: 'slot', class: 'whole-width', saveKey: 'proTasks', getOptions: '', itemKey: 'taskNo', itemLabel: 'taskCn', options: [], unClick: false}
        ],
        rules: {
          processNo: [
            {required: true, message: '必填项', trigger: 'change'}
          ]
        }
      },
      tempProTask: {},
      tempProTaskDialog: {
        visible: false,
        title: '任务-操作关联',
        width: '1000px',
        appendToBody: true,
        inline: true,
        className: 'twiceCol temp-pro-task-dialog',
        key: 'processNo',
        formData: [
          {key: 'processCn', label: '航班流程', type: 'span'},
          {key: 'taskCn', label: '任务名称', type: 'span'},
          {
            key: 'operations',
            label: '',
            type: 'slot',
            class: 'whole-width',
            saveKey: 'proTask',
            getOptions: '',
            itemKey: 'operationNo',
            itemLabel: 'operationCn',
            filterMethod: this.optionFilter,
            options: [],
            editIndex: null,
            getSelectOptions: '/taskbasic/reProcessNode/queryNodeByProcess',
            tabelFields: [
              {prop: 'operationCn', label: '操作名称', width: '125', type: 'span'},
              {prop: 'refNodeCn', editProp: 'refNodeNoArr', label: '参考节点', width: '125', type: 'select', filterable: true, clearable: true, saveKey: 'refNodeNo', valueKey: 'nodeNo', itemKey: 'nodeNo', itemLabel: 'nodeName', change: this.changeTempRefNo},
              {prop: 'refTimeOffset', label: '参考时间偏移', width: '105', type: 'input', min: -99999, max: 99999},
              {prop: 'updNodeCn', editProp: 'updNodeNoArr', label: '更新节点', width: '125', type: 'select', filterable: true, clearable: true, saveKey: 'updNodeNo', valueKey: 'nodeNo', itemKey: 'nodeNo', itemLabel: 'nodeName', change: this.changeTempUpdNo},
              {prop: 'taskTimeType', label: '更新任务类型', width: '95', type: 'tabs', filterable: true, clearable: true, itemKey: 'code', itemLabel: 'name', options: [{code: 'B', name: '开始'}, {code: 'E', name: '结束'}]}
            ],
            tempTask: {},
            tempData: {
              operationNo: '',
              operationCn: '',
              refNodeNo: '',
              refNodeCn: '',
              refTimeOffset: '',
              updNodeNo: '',
              updNodeCn: '',
              taskTimeType: ''
            }
          }
        ]
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
          // 'p': '任务名称',
          key: 'taskCn',
          value: '',
          type: 'input',
          inputText: '任务名称',
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
        key: 'processNo',
        multipleSelection: [],
        fields: [
          {prop: 'processCn', label: '流程名称', fixed: true, hidden: false, sortable: true, width: '300'},
          {prop: 'proTasks', label: '关联任务', type: 'slotScope', fixed: false, hidden: false}
        ]
      },
      showPopUrl: 'taskbasic/taskOperations/queryByProcess',
      showPopData: [],
      showOprUrl: 'taskbasic/taskOperations/queryAll'
    }
  },
  methods: {
    // 发送分页查询请求
    queryDataReq () {
      this.getQueryData()
      postData(this.queryUrl, this.queryData).then(response => {
        this.setLastUpdateTime()
        this.tableData.data = response.data.data
        this.pageData.total = response.data.data.length
      })
    },
    clickDiv (row, index) {
      var data = {
        processNo: row.processNo,
        taskNo: row.proTasks[index].taskNo
      }
      queryAll(this.showPopUrl, data).then(res => {
        if (res.data.code == 0) {
          this.showPopData = res.data.data
        }
      })
    },
    getCol (taskType) {
      switch (taskType) {
        case 'V':return '特车任务'
        case 'N':return '普通任务'
        case 'S':return '特殊任务'
      }
    },
    addOpr (scopeTemp, index) {
      scopeTemp.data[scopeTemp.item.key].push(scopeTemp.item.options[index])
      scopeTemp.item.options.splice(index, 1)
      this.$nextTick(() => {
        var element = document.getElementsByClassName('task-pro-cont-table-tr')
        if (element.length) {
          element[element.length - 1].scrollIntoView(false)
        }
      })
    },
    addTask (scope, index) {
      if (!scope.data.processNo) {
        this.showError('添加', '请先选择航班流程 !')
      } else {
        scope.item.unClick = true
        var data = {
          taskNo: scope.item.options[index].taskNo
        }
        var _this = this
        queryAll(this.showOprUrl, data).then(res => {
          if (res.data.code == 0) {
            var obj = {
              taskNo: scope.item.options[index].taskNo,
              taskCn: scope.item.options[index].taskCn,
              taskType: scope.item.options[index].taskType,
              isActive: 'Y',
              operations: res.data.data
            }
            scope.data[scope.item.key].push(obj)
            scope.item.options.splice(index, 1)
            scope.item.unClick = false
            this.$nextTick(() => {
              var element = document.getElementsByClassName('task-pro-task')
              if (element.length) {
                element[element.length - 1].scrollIntoView(false)
              }
            })
          }
        })
      }
    },
    saveOpr (scopeTemp, item, index) {
      var result = this.oprRefTimeReg(item.refTimeOffset)
      if (result) {
        this.showError('保存', '参考时间偏移' + result)
      } else {
        this.tempData = {}
        scopeTemp.item.tabelFields.forEach(field => {
          if (field.hasOwnProperty('saveKey')) {
            if (item[field.editProp]) {
              this.$set(item, field.saveKey, item[field.editProp][field.valueKey])
            } else {
              this.$set(item, field.saveKey, null)
            }
          }
        })
        scopeTemp.item.editIndex = null
      }
    },
    cancelOpr (scopeTemp, index) {
      this.$set(scopeTemp.data[scopeTemp.item.key], index, this.tempData)
      scopeTemp.item.editIndex = null
    },
    editOpr (scopeTemp, index) {
      if (scopeTemp.item.editIndex != null) {
        this.cancelOpr(scopeTemp, scopeTemp.item.editIndex)
      }
      var obj = {}
      scopeTemp.item.editIndex = index
      this.tempData = JSON.parse(JSON.stringify({
        operationNo: scopeTemp.data[scopeTemp.item.key][index].operationNo,
        operationCn: scopeTemp.data[scopeTemp.item.key][index].operationCn,
        refNodeNo: scopeTemp.data[scopeTemp.item.key][index].refNodeNo,
        refNodeCn: scopeTemp.data[scopeTemp.item.key][index].refNodeCn,
        refTimeOffset: scopeTemp.data[scopeTemp.item.key][index].refTimeOffset,
        updNodeNo: scopeTemp.data[scopeTemp.item.key][index].updNodeNo,
        updNodeCn: scopeTemp.data[scopeTemp.item.key][index].updNodeCn,
        taskTimeType: scopeTemp.data[scopeTemp.item.key][index].taskTimeType
      }))
      for (var i = 0; i < this.tempProTaskDialog.formData[2].tabelFields.length; i++) {
        if (this.tempProTaskDialog.formData[2].tabelFields[i].hasOwnProperty('saveKey')) {
          obj = _.find(this.tempProTaskDialog.formData[2].tabelFields[i].options, [this.tempProTaskDialog.formData[2].tabelFields[i].itemKey, scopeTemp.data[scopeTemp.item.key][index][this.tempProTaskDialog.formData[2].tabelFields[i].saveKey]])
          // this.tempData[this.tempProTaskDialog.formData[2].tabelFields[i].editProp] = obj
          this.$set(scopeTemp.data[scopeTemp.item.key][index], this.tempProTaskDialog.formData[2].tabelFields[i].editProp, obj)
        }
      }
    },
    editTask (scope, index) {
      var data = {}
      this.tempProTask = scope.data.proTasksTemp[index]
      for (let i = 0; i < this.tempProTaskDialog.formData.length; i++) {
        if (this.tempProTaskDialog.formData[i].key == 'processCn') {
          this.$set(this.tempProTaskDialog.formData[i], 'value', scope.data[this.tempProTaskDialog.formData[i].key])
        } else if (this.tempProTaskDialog.formData[i].key == 'taskCn') {
          this.$set(this.tempProTaskDialog.formData[i], 'value', scope.data.proTasksTemp[index][this.tempProTaskDialog.formData[i].key])
        } else if (this.tempProTaskDialog.formData[i].key == 'operations') {
          this.$set(this.tempProTaskDialog.formData[i], 'value', this.tempProTask[this.tempProTaskDialog.formData[i].key])
          if (_.isObject(scope.data.processNo)) {
            data = {
              processNo: scope.data.processNo.processNo,
              taskNo: scope.data.proTasksTemp[index]['taskNo']
            }
          } else {
            data = {
              processNo: scope.data.processNo,
              taskNo: scope.data.proTasksTemp[index]['taskNo']
            }
          }
          this.tempProTaskDialog.formData[i].getOptions = '/taskbasic/taskOperations/queryAll'
          this.$set(this.tempProTaskDialog.formData[i], 'optionsQuery', data)
          queryAll(this.tempProTaskDialog.formData[i].getSelectOptions, data).then(res => {
            if (res.data.code == 0) {
              for (let j = 0; j < this.tempProTaskDialog.formData[i].tabelFields.length; j++) {
                if (this.tempProTaskDialog.formData[i].tabelFields[j].type == 'select') {
                  this.$set(this.tempProTaskDialog.formData[i].tabelFields[j], 'options', res.data.data)
                }
              }
            }
          })
        }
      }
      this.tempProTaskDialog.index = index
      this.tempProTaskDialog.visible = true
    },
    optionFilter (obj, callback) {
      var arr = _.differenceBy(obj.options, obj.item.value, obj.item.itemKey)
      callback(arr)
    },
    deleteOpr (scopeTemp, index) {
      var temp = scopeTemp.data[scopeTemp.item.key][index]
      scopeTemp.data[scopeTemp.item.key].splice(index, 1)
      scopeTemp.item.options.push(temp)
    },
    deleteTask (scope, index) {
      var temp = scope.data[scope.item.key][index]
      scope.data[scope.item.key].splice(index, 1)
      scope.item.options.push(temp)
    },
    upOpr (scopeTemp, index) {
      if (index > 0) {
        var temp = scopeTemp.data[scopeTemp.item.key][index]
        scopeTemp.data[scopeTemp.item.key].splice(index, 1)
        scopeTemp.data[scopeTemp.item.key].splice(index - 1, 0, temp)
      }
    },
    upTask (scope, index) {
      if (index > 0) {
        var temp = scope.data[scope.item.key][index]
        scope.data[scope.item.key].splice(index, 1)
        scope.data[scope.item.key].splice(index - 1, 0, temp)
      }
    },
    itemChangeHandle (data, item, method) {
      if (method) {
        method(data[item.editProp], param => {
          if (Array.isArray(param)) {
            param.forEach(par => {
              this.$set(data, par.key, par.value)
            })
          } else {
            this.$set(data, param.key, param.value)
          }
        })
      }
    },
    changeTempRefNo (obj, callback) {
      let proObj = {
        key: 'refNodeCn',
        value: obj.nodeName
      }
      callback(proObj)
      return proObj
    },
    changeTempUpdNo (obj, callback) {
      let proObj = {
        key: 'updNodeCn',
        value: obj.nodeName
      }
      callback(proObj)
      return proObj
    },
    changeNo (obj, callback) {
      let proObj = [{
        key: 'proTasksTemp',
        value: []
      }, {
        key: 'processCn',
        value: obj.processCn
      }]
      queryAll('/taskbasic/tasks/queryAll', {}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].key == 'proTasksTemp') {
              this.$set(this.formData.formData[i], 'options', res.data.data)
              callback(proObj)
              return
            }
          }
        } else {
          callback(proObj)
          return null
        }
      })
    },
    handleTempCancle (scope) {
      if (this.tempProTaskDialog.formData[2].editIndex != null) {
        this.tempProTaskDialog.formData[2].editIndex = null
      }
      this.tempProTaskDialog.visible = false
    },
    handleTempSave (scope) {
      if (this.tempProTaskDialog.formData[2].editIndex != null) {
        var temp = {
          item: this.tempProTaskDialog.formData[2],
          data: this.tempProTask
        }
        this.cancelOpr(temp, this.tempProTaskDialog.formData[2].editIndex)
      }
      this.$set(scope.data.proTasksTemp, this.tempProTaskDialog.index, JSON.parse(JSON.stringify(this.tempProTask)))
      this.tempProTaskDialog.visible = false
    },
    // 新增
    handleAdd () {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].key == 'processNo') {
          this.$delete(this.formData.formData[i], 'isHidden')
        }
        if (this.formData.formData[i].key == 'processCn') {
          this.$set(this.formData.formData[i], 'isHidden', true)
        }
        if (this.formData.formData[i].key == 'proTasksTemp') {
          this.formData.formData[i].getOptions = '/taskbasic/tasks/queryAll'
          this.formData.formData[i].unClick = false
        }
      }
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      queryAll(this.getEditDataUrl, {processNo: row.processNo}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].hasOwnProperty('saveKey')) {
              this.$set(this.formData.formData[i], 'value', res.data.data[this.formData.formData[i].saveKey])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data[this.formData.formData[i].key])
            }
            if (this.formData.formData[i].key == 'processNo') {
              this.$set(this.formData.formData[i], 'isHidden', true)
            }
            if (this.formData.formData[i].key == 'processCn') {
              this.$delete(this.formData.formData[i], 'isHidden')
            }
            if (this.formData.formData[i].key == 'proTasksTemp') {
              this.formData.formData[i].getOptions = '/taskbasic/processTask/queryNoProcessTask'
              this.$set(this.formData.formData[i], 'optionsQuery', {'processNo': row.processNo})
              this.formData.formData[i].unClick = true
            }
          }
          this.formData.title = '详情'
          this.formData.visible = true
        }
      })
    },
    // 编辑
    handleEdit (row) {
      queryAll(this.getEditDataUrl, {processNo: row.processNo}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].hasOwnProperty('saveKey')) {
              this.$set(this.formData.formData[i], 'value', res.data.data[this.formData.formData[i].saveKey])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data[this.formData.formData[i].key])
            }
            if (this.formData.formData[i].key == 'processNo') {
              this.$set(this.formData.formData[i], 'isHidden', true)
            }
            if (this.formData.formData[i].key == 'processCn') {
              this.$delete(this.formData.formData[i], 'isHidden')
            }
            if (this.formData.formData[i].key == 'proTasksTemp') {
              this.formData.formData[i].getOptions = '/taskbasic/processTask/queryNoProcessTask'
              this.$set(this.formData.formData[i], 'optionsQuery', {'processNo': row.processNo})
              this.formData.formData[i].unClick = false
            }
          }
          this.formData.title = '编辑'
          this.formData.visible = true
        }
      })
    },
    // 删除
    handleDelete (id) {
      var data = []
      if (id) {
        data.push(id[this.tableData.key])
      } else {
        this.tableData.multipleSelection.forEach(item => {
          data.push(item[this.tableData.key])
        })
      }
      this.deleteData.data = {}
      this.$set(this.deleteData.data, this.formData.key, data.join(','))
      this.deleteData.visible = true
    }
  }
}
</script>

<style scoped>
.page-table-view .pro-task-opr-div-row {
  display: flex;
  flex-wrap: wrap;
}
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
.page-table-view .pro-task-div:hover {
  opacity: 0.8;
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
.pro-task-opr-div {
  margin-bottom: 10px;
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
  height: calc(100vh - 270px);
}
.pro-task-oprs-div {
  height: calc(486px - 82px);
}
.pro-task-opr-div-com>div {
  border: 1px solid rgba(60,166, 200, 0.6);
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 30px rgba(60, 166, 200, 0.3) inset;
  border-radius: 12px;
}
.pro-task-opr-div-com .task-pool-div {
  margin-right: 20px;
  flex-grow: 0;
}
.pro-tasks-opr-div .task-pool-div {
  width: 220px;
  padding: 0 4px 10px 20px;
}
.pro-task-oprs-div .task-pool-div {
  width: 180px;
  padding: 0 4px 10px 12px;
}
.pro-task-opr-div-com .task-pro-div {
  flex-grow: 1;
  padding: 0 0 10px 0;
}
.pro-task-opr-div-com .task-div-header {
  font-size: 16px;
  color: #7a939e;
}
.pro-tasks-opr-div .task-div-header {
  height: 50px;
  line-height: 50px;
}
.pro-task-oprs-div .task-div-header {
  height: 40px;
  line-height: 40px;
}
.pro-task-opr-div-com .task-pro-div .task-div-header {
  padding: 0 20px;
}
.pro-task-opr-div-com .task-div-tasks-list {
  overflow-x: hidden;
}
.pro-tasks-opr-div .task-div-tasks-list {
  height: calc(100% - 50px);
}
.pro-task-oprs-div .task-div-tasks-list {
  height: calc(100% - 40px);
}
.pro-task-oprs-div .task-pro-div .task-div-tasks-list {
  overflow: hidden;
}
.pro-task-oprs-div .task-pro-div .task-div-tasks-list .div-body {
  overflow-y: auto;
  height: calc(352px - 44px);
}
.pro-task-opr-div-com .task-pool-div .task-pool-task {
  color: #fff;
  font-size: 16px;
  /* padding: 0 20px; */
  background-color: rgba(54, 141, 178, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
}
.pro-task-opr-div-com .task-pool-div .task-pool-task:hover {
  background-color: rgba(54, 141, 178, 0.7);
}
.button-font {
  padding: 0 0 0 20px;
  width: calc(100% - 50px);
  overflow: hidden;
  white-space: nowrap;
}
.button-icon {
  width: 30px;
  height: 30px;
  flex-grow: 0;
  margin-right: 6px;
}
.button-add {
  background-image: url('../../../assets/img/btn_icon_add.png')
}
.pro-tasks-opr-div .task-pool-div .task-pool-task {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  margin-right: 16px;
  overflow: hidden;
  white-space: nowrap;
}
.pro-task-oprs-div .task-pool-div .task-pool-task {
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  margin-right: 8px;
  overflow: hidden;
  white-space: nowrap;
}
.pro-task-opr-div-com .task-pro-div .task-pro-task {
  padding: 0 10px 16px 20px;
}
.pro-task-opr-div-com .task-pro-div .task-pro-task.task-single {
  background-color: rgba(60,166,200,0.1);
}
.pro-task-opr-div-com .task-pool-div .task-pool-task:not(:last-of-type) {
  margin-bottom: 10px;
}
.task-pro-task .task-pro-head {
  height: 40px;
}
.task-pro-task .task-pro-cont {
  margin: 4px 0 -10px 0;
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
  min-height: 16px;
  word-wrap: break-word;
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
