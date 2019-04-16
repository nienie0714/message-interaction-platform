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
          <div class="task-pool-div">
            <div class="task-div-header">节点池</div>
            <div class="task-div-tasks-list">
              <div v-for="(item, index) in scopeTemp.item.options" :key="item[scopeTemp.item.itemKey]"
              :class="scopeTemp.item.unClick?'task-pool-task div-disabled':'task-pool-task'"
              @click="!scopeTemp.item.unClick&&addOpr(scopeTemp, index)">
                <div class="button-font">{{item[scopeTemp.item.itemLabel]}}</div>
                <div :class="`${scopeTemp.item.unClick?'':'button-add'} button-icon`"></div>
              </div>
            </div>
          </div>
          <div class="task-pro-div">
            <div class="task-div-header">关联节点</div>
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
                          <div class="td-edit-div" :style="{width: field.width + 'px'}">
                            <span v-if="field.type == 'span'" class="span-label">{{item[field.prop]?item[field.prop]:''}}</span>
                            <el-select v-else-if="field.type == 'select'" v-model="item[field.editProp]" :placeholder="field.label" @change="itemChangeHandle(item, field, field.change)"
                            :filterable="field.filterable" :clearable="field.clearable" :default-first-option="field.filterable" :value-key="field.valueKey">
                              <el-option v-for="option in field.options" :key="option.index" :label="option[field.itemLabel]" :value="field.hasOwnProperty('valueKey') ? option : option[field.itemKey]">
                                <span style="float: left">{{ option[field.itemLabel] }}</span>
                                <span v-if="field.hasOwnProperty('itemLabelSpan')" style="float: right; color: #8492a6; font-size: 13px">{{ option[field.itemLabelSpan] }}</span>
                              </el-option>
                            </el-select>
                            <!-- tabs选择标签 -->
                            <el-radio-group v-if="field.type == 'tabs'" v-model="item[field.prop]">
                              <el-radio-button v-for="option in field.options" :key="option.index" :label="option[field.itemKey]">{{ option[field.itemLabel] }}</el-radio-button>
                            </el-radio-group>
                            <el-input v-else-if="field.type == 'input'" v-model.trim.lazy="item[field.prop]" :placeholder="field.label" auto-complete="off" :maxlength="field.maxlength" :min="field.min" :max="field.max"></el-input>
                          </div>
                        </td>
                        <td class="cont-tr-div table-opt-col">
                          <div class="tool-div-button opr-edit-save" @click="saveOpr(scopeTemp, item, index)"></div>
                          <div class="tool-div-button opr-edit-cancel" @click="cancelOpr(scopeTemp, index)"></div>
                        </td>
                      </div>
                      <div v-else class="tr-div-td">
                        <td v-for="field in scopeTemp.item.tabelFields" :key="field.prop" class="cont-tr-div" :width="field.width">
                          <div v-if="['isMilestone', 'isActive'].includes(field.prop)">{{item[field.prop]=='Y'?'是':(item[field.prop]=='N'?'否':'')}}</div>
                          <div v-else>{{item[field.prop]?item[field.prop]:' '}}</div>
                        </td>
                        <td class="cont-tr-div table-opt-col">
                          <div :class="scopeTemp.item.unClick?'tool-div-button button-edit div-disabled':'tool-div-button button-edit'" @click="!scopeTemp.item.unClick&&editOpr(scopeTemp, index)"></div>
                          <div :class="scopeTemp.item.unClick?'tool-div-button button-delete div-disabled':'tool-div-button button-delete'" @click="!scopeTemp.item.unClick&&deleteOpr(scopeTemp, index)"></div>
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
      baseUrl: 'taskbasic/reProcessNode',
      // 获取编辑/详情页面节点数据路径
      getEditDataUrl: '/taskbasic/reProcessNode/queryAll',
      // 编辑路径
      editUrl: 'taskbasic/reProcessNode/batchSave',
      // 分页参数
      pageData: {
        currentPage: 1,
        pageSizes: [20, 30, 50],
        pageSize: 20,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0
      },
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        width: '1100px',
        className: 'twiceCol',
        key: 'processNo',
        formData: [
          {key: 'processNo', label: '航班流程编号', type: 'pInput', isHidden: true},
          {key: 'processCn', label: '航班流程', type: 'pInput'},
          {
            key: 'nodes',
            label: '',
            type: 'slot',
            class: 'whole-width',
            itemKey: 'nodeNo',
            itemLabel: 'nodeCn',
            filterMethod: this.optionFilter,
            options: [],
            unClick: false,
            editIndex: null,
            getOptions: '/taskbasic/nodes/queryAll',
            getSelectOptions: '/taskbasic/nodes/queryAll',
            tabelFields: [
              {prop: 'nodeCn', label: '节点名称', width: '105', type: 'span'},
              {prop: 'isMilestone', label: '是否里程碑', width: '112', type: 'tabs', filterable: true, clearable: true, itemKey: 'code', itemLabel: 'name', options: [{code: 'Y', name: '是'}, {code: 'N', name: '否'}]},
              {prop: 'refNodeCn', editProp: 'refNodeNoArr', label: '参考节点', width: '125', type: 'select', filterable: true, clearable: true, saveKey: 'refNodeNo', valueKey: 'nodeNo', itemKey: 'nodeNo', itemLabel: 'nodeName', change: this.changeTempRefNo},
              {prop: 'refTimeOffset', label: '参考时间偏移', width: '115', type: 'input', min: -99999, max: 99999},
              {prop: 'isActive', label: '是否激活', width: '105', type: 'tabs', filterable: true, clearable: true, itemKey: 'code', itemLabel: 'name', options: [{code: 'Y', name: '是'}, {code: 'N', name: '否'}]},
              {prop: 'sortkey', label: '鱼骨图排序码', width: '110', type: 'input', min: 0, max: 999}
            ],
            tempData: {}
          }
        ]
      },
      // 查询条件每行个数
      colSize: 5,
      // 查询条件设置
      queryList: [
        {
          // 'p': '航班流程',
          key: 'processNo',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'processNo',
          optLabel: 'processCn',
          inputText: '航班流程',
          getOptions: 'taskbasic/processDef/queryAll',
          span: 4
        }, {
          // 'p': '节点',
          key: 'nodeNo',
          value: '',
          type: 'select',
          filterable: true,
          optKey: 'nodeNo',
          optLabel: 'nodeCn',
          inputText: '节点',
          getOptions: 'taskbasic/nodes/queryAll',
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
          {prop: 'processCn', label: '航班流程', fixed: true, hidden: false},
          {prop: 'nodeCnStr', label: '节点', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
    // 查询后的自定义方法
    customAfterQuery () {
      this.tableData.data.forEach(item => {
        if (item.hasOwnProperty('nodeCns')) {
          this.$set(item, 'nodeCnStr', item.nodeCns.join(','))
        }
      })
    },
    optionFilter (obj, callback) {
      var arr = _.differenceBy(obj.options, obj.item.value, obj.item.itemKey)
      callback(arr)
    },
    addOpr (scopeTemp, index) {
      var obj = {}
      _.forEach(scopeTemp.item.tabelFields, (value) => {
        if ((value.type == 'tabs') && ((!scopeTemp.item.options[index].hasOwnProperty(value.prop)) || (!scopeTemp.item.options[index][value.prop]))) {
          obj = _.head(value.options)
          this.$set(scopeTemp.item.options[index], value.prop, obj[value.itemKey])
        }
      })
      scopeTemp.data[scopeTemp.item.key].push(scopeTemp.item.options[index])
      scopeTemp.item.options.splice(index, 1)
      this.$nextTick(() => {
        var element = document.getElementsByClassName('task-pro-cont-table-tr')
        if (element.length) {
          element[element.length - 1].scrollIntoView(false)
        }
      })
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
    editOpr (scopeTemp, index) {
      if (scopeTemp.item.editIndex != null) {
        this.cancelOpr(scopeTemp, scopeTemp.item.editIndex)
      }
      scopeTemp.item.editIndex = index
      this.tempData = JSON.parse(JSON.stringify(scopeTemp.data[scopeTemp.item.key][index]))
      var obj = {}
      for (var i = 0; i < this.formData.formData[2].tabelFields.length; i++) {
        if (this.formData.formData[2].tabelFields[i].hasOwnProperty('saveKey')) {
          obj = _.find(this.formData.formData[2].tabelFields[i].options, [this.formData.formData[2].tabelFields[i].itemKey, scopeTemp.data[scopeTemp.item.key][index][this.formData.formData[2].tabelFields[i].saveKey]])
          this.$set(scopeTemp.data[scopeTemp.item.key][index], this.formData.formData[2].tabelFields[i].editProp, obj)
        }
      }
      queryAll(this.formData.formData[2].getSelectOptions, {}).then(res => {
        if (res.data.code == 0) {
          for (let j = 0; j < this.formData.formData[2].tabelFields.length; j++) {
            if (this.formData.formData[2].tabelFields[j].type == 'select') {
              this.$set(this.formData.formData[2].tabelFields[j], 'options', res.data.data)
            }
          }
        }
      })
    },
    deleteOpr (scopeTemp, index) {
      var temp = scopeTemp.data[scopeTemp.item.key][index]
      scopeTemp.data[scopeTemp.item.key].splice(index, 1)
      scopeTemp.item.options.push(temp)
    },
    saveOpr (scopeTemp, item, index) {
      var result = this.oprRefTimeReg(item.refTimeOffset)
      if (result) {
        this.showError('保存', '参考时间偏移' + result)
      } else {
        result = this.oprSortkeyReg(item.sortkey)
        if (result) {
          this.showError('保存', '排序码' + result)
        } else {
          this.tempData = {}
          scopeTemp.item.tabelFields.forEach(field => {
            if (field.hasOwnProperty('saveKey')) {
              if (item[field.editProp]) {
                this.$set(item, field.saveKey, item[field.editProp][field.valueKey])
                this.$delete(item, field.editProp)
              } else {
                this.$set(item, field.saveKey, null)
              }
            }
          })
          scopeTemp.item.editIndex = null
        }
      }
    },
    cancelOpr (scopeTemp, index) {
      this.$set(scopeTemp.data[scopeTemp.item.key], index, this.tempData)
      scopeTemp.item.editIndex = null
    },
    // 新增/编辑前操作
    customSaveBefore (data) {
      var temp = {
        item: this.formData.formData[2],
        data: data
      }
      if (temp.item.editIndex != null) {
        this.cancelOpr(temp, temp.item.editIndex)
      }
      return data
    },
    // 新增
    handleAdd () {
      this.formData.formData[2].unClick = false
      this.formData.formData[2].editIndex = null
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      queryAll(this.getEditDataUrl, {processNo: row.processNo}).then(res => {
        if (res.data.code == 0) {
          for (let i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].type != 'slot') {
              this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data)
              this.formData.formData[i].editIndex = null
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
            if (this.formData.formData[i].type != 'slot') {
              this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
            } else {
              this.$set(this.formData.formData[i], 'value', res.data.data)
              this.formData.formData[i].editIndex = null
              this.formData.formData[i].unClick = false
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
  height: calc(100vh - 270px);
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
.pro-task-opr-div-com .task-pro-div .task-div-header {
  padding: 0 20px;
}
.pro-task-opr-div-com .task-div-tasks-list {
  overflow-x: hidden;
}
.pro-task-opr-div-com .task-div-tasks-list .div-body.task-pro-cont-table-div {
  overflow-x: hidden;
  height: calc(100% - 44px);
}
.pro-tasks-opr-div .task-div-tasks-list {
  height: calc(100% - 50px);
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
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.td-edit-div input {
  border-radius: 6px;
}
</style>
