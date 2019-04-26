<template>
  <div class="dialog-form-edit">
    <el-dialog :inline="formData.inline" :title="formData.title" :visible.sync="formData.visible" :append-to-body="formData.appendToBody"
    :custom-class="formData.className" :close-on-click-modal="false" @open="handleOpen" @close="handleClose" :width="formData.width?formData.width:'480px'">
      <div slot="title" class="dialog-header">
        <img :src="require('@img/title_deco.png')" />
        <span class="header-title">{{ formData.title }}</span>
      </div>
      <el-form :model="editData" :rules="rules" :label-position="'top'" ref="ruleForm" size="mini" :disabled="formData.title == '详情'" class="edit-form">
        <div v-for="item in formData.formData" :key="item.key">
          <el-form-item v-if="!item.isHidden && !item.hidden" :label="item.label" :prop="item.key" :label-width="item.labelWidth" :class="item.class">
            <!-- 文本 -->
            <span v-if="item.type == 'span'" class="span-label">{{editData[item.key]?editData[item.key]:''}}</span>
            <!-- 不可编辑框 -->
            <el-input v-if="item.type == 'pInput'" type="input" v-model.trim="editData[item.key]" disabled></el-input>
            <!-- input输入框 -->
            <el-input v-if="item.type == 'input' || item.type == 'password'" :type="item.type" v-model.trim.lazy="editData[item.key]" auto-complete="off" :disabled="item.disabled" :maxlength="item.maxlength" :minlength="item.minlength"
            @blur="itemChangeHandle(item, item.change)" @change="handleToUpper(item)"></el-input>
            <!-- number选择器 -->
            <el-input-number v-if="item.type == 'number'" v-model.trim.lazy="editData[item.key]" :controls-position="item.position" @change="itemChangeHandle(item, item.change)" :min="item.min" :max="item.max" :step="item.step"></el-input-number>
            <!-- textarea输入框 -->
            <el-input v-if="item.type == 'textarea'" type="textarea" v-model.trim="editData[item.key]" auto-complete="off" :disabled="item.disabled" @blur="itemChangeHandle(item, item.change)" :maxlength="item.maxlength"
            :autosize="item.autosize"></el-input>
            <!-- select下拉框 -->
            <el-select :ref="item.key" v-if="item.type == 'select'" v-model="editData[item.key]" :placeholder="'请选择' + item.label" :disabled="item.disabled" @change="itemChangeHandle(item, item.change)"
            :multiple="item.multiple" :multiple-limit="item.multipleLimit" :filterable="item.filterable" :clearable="item.clearable ? false : true" :default-first-option="item.filterable" :value-key="item.valueKey">
              <el-option v-for="option in item.options" :key="option.index" :label="typeof(option) != 'object' ? option : option[item.itemLabel]" :value="((typeof(option) != 'object') || item.hasOwnProperty('valueKey')) ? option : (item.hasOwnProperty('itemValue') ? option[item.itemValue] : option[item.itemKey])">
                <span style="float: left">{{ typeof(option) != 'object' ? option : option[item.itemLabel] }}</span>
                <span v-if="item.hasOwnProperty('itemLabelSpan')" style="float: right; color: #8492a6; font-size: 13px">{{ option[item.itemLabelSpan] }}</span>
              </el-option>
            </el-select>
            <!-- tabs选择标签 -->
            <el-radio-group v-if="item.type == 'tabs'" v-model="editData[item.key]" :size="item.size" :disabled="item.disabled" @change="itemTabsChangeHandle(item, item.change)"><!--  :change="valueChange(data)" -->
              <el-radio-button v-for="option in item.options" :key="option.key" :label="option.key"> {{ option.value }}</el-radio-button>
            </el-radio-group>
            <!-- checkbox复选框 -->
            <el-checkbox-group v-if="item.type == 'checkbox'" v-model="editData[item.key]">
              <el-checkbox v-for="(option, index) in item.options" :label="typeof(option) != 'object' ? option : option[item.itemKey]" :key="index">{{ typeof(option) != 'object' ? option : option[item.itemLabel] }}</el-checkbox>
            </el-checkbox-group>
            <!-- cascader级联选择器 -->
            <el-cascader v-if="item.type == 'casc'" v-model="editData[item.key]" :disabled="item.disabled" expand-trigger="hover" :clearable="item.clearable?false:true"
            :options="item.options" :props="item.props" filterable :change-on-select="item.selectChange?false:true" @change="handleCascChange(item, item.change)"></el-cascader><!--  @blur="itemChangeHandle(item, item.change)" -->
            <!-- transfer穿梭框 -->
            <el-transfer v-if="item.type == 'trans'" :titles="item.titles" :data="item.options" v-model="editData[item.key]" :props="item.props" ref="formTrans"
            :filter-placeholder="'请输入' + item.label" filterable :filter-method="item.handleFilterMethod"
            :left-default-checked="defaultChecked" :right-default-checked="defaultChecked"></el-transfer>
            <!-- tree树形控件 -->
            <el-tree v-if="item.type == 'tree'" :data="item.options" :show-checkbox="item.showCheckbox" :node-key="item.itemKey" :props="item.props" :ref="'tree'+item.key"
            :default-checked-keys="editData[item.key]" :check-strictly="item.checkStrictly" :default-expand-all="item.defaultExpendAll" :default-expanded-keys="item.defaultExpandArr"  :filter-node-method="filterNode"></el-tree>
            <div v-if="item.type == 'tree' && item.selectButton" class="tree-select-all">
              <el-checkbox v-model="item.selectAll" @change="treeButtonChange(item)">全部</el-checkbox>
            </div>
            <div v-if="item.type == 'tree' && item.filterButton" class="tree-filter-all tree-select-all">
              <el-input v-model="item.filterAll" clearable :placeholder="item.filterPlaceholder?item.filterPlaceholder:'过滤内容'" @keyup.enter.native="treeFilterChange(item.key, item.filterAll)"></el-input>
            </div>
            <!-- 日期选择器 -->
            <!-- year/month/date/dates/week/datetime/datetimerange/daterange -->
            <!-- yyyy-年/M、MM-月/W、WW-周/dd-日/HH-24小时制/hh-12小时制、须和A、a-am、PM使用/mm-分/ss-秒/timestamp-时间戳：组件绑定类型为number -->
            <el-date-picker v-if="item.type == 'year' || item.type == 'month' || item.type == 'date' || item.type == 'dates' || item.type == 'week' || item.type == 'datetime' || item.type == 'datetimerange' || item.type == 'daterange'"
            v-model="editData[item.key]" :type="item.type" :placeholder="'请选择' + item.label" :editable="item.editable" :clearable="item.clearable" :picker-options="item.hasOwnProperty('pickerOpt') ? item.pickerOpt : {}"
            :size="item.size" :align="item.align" :default-value="item.defaultDate" :format="item.format" :value-format="item.valueFormat" :readonly="item.readonly" :disabled="item.disabled"
            :start-placeholder="item.startPlaceholder || '开始时间'" :end-placeholder="item.endPlaceholder || '结束时间'" :range-separator="item.separator"
            @change="itemChangeHandle(item, item.change)"></el-date-picker>
            <!-- 时间选择器 -->
            <el-time-picker v-if="item.type == 'time'" v-model="editData[item.key]" :readonly="item.readonly" :disabled="item.disabled" :editable="item.editable?false:true"
            :clearable="item.clearable?false:true" :format="item.format" :value-format="item.valueFormat" :placeholder="'请选择' + item.label" :picker-options="item.pickerOpt">
            </el-time-picker>
            <!-- 自定义日期区间选择器 -->
            <Date-range-picker v-if="item.type == 'dateRangePicker'" :dateRange="item" :editData="editData" v-model="editData[item.key]"></Date-range-picker>
            <!-- 图片上传 -->
            <el-upload v-if="item.type == 'upload'" :action="item.action" :accept="`image/${ item.fileType[0] },image/${ item.fileType[2] }`"
            :multiple="item.multiple?item.multiple:false" :file-list="fileList" :show-file-list="item.showFile"
            :auto-upload="item.autoUpload?item.autoUpload:false" :on-remove="handleRemove" :on-change="handleChange" :http-request="httpRequest" ref="upload">
              <el-button slot="trigger" type="primary">选取图标</el-button>
              <div class="file-content">
                <img v-if="fileList.length>0" :src="fileList[fileList.length-1].url">
                <img v-else :src="dfsUrl + editData[item.key]">
              </div>
              <el-progress v-if="showProgress" :percentage="progress"></el-progress>
            </el-upload>
            <!-- 文件上传 -->
            <el-upload v-if="item.type == 'uploadFile'" :action="item.action" :multiple="item.multiple?item.multiple:false" :file-list="fileList"
            :show-file-list="item.showFile"
            :auto-upload="item.autoUpload?item.autoUpload:false" :on-remove="handleRemove" :on-change="handleChange2" :http-request="httpRequest" ref="upload">
              <el-button size="small" type="primary">选择文件</el-button>
              <el-progress v-if="showProgress" :percentage="progress"></el-progress>
            </el-upload>
            <!-- 自定义内容 -->
            <slot name="slot-scope" v-if="item.type == 'slot'" :item="item" :data="editData"></slot>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button v-if="formData.title != '详情'" type="primary" @click="handleSave" :loading="formData.loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DateRangePicker from './DateRangePicker'
import basicMsgMixin from '../mixin/basicMsgMixin'
import {queryAll, dfsPost, postData, getQueryAll} from '../../api/base.js'
import _ from 'lodash'

export default {
  components: {
    DateRangePicker
  },
  mixins: [basicMsgMixin],
  props: ['formData'],
  data () {
    return {
      editData: {},
      rules: {},
      uniqueCount: 0,
      defaultChecked: [],
      requiredArr: [{required: true, message: '必填项', trigger: 'change'}],
      fileList: [],
      fileItem: null,
      progress: 0,
      showProgress: false,
      dfsUrl: ''
    }
  },
  created () {
    this.formData.formData.forEach(item => {
      if (item.hasOwnProperty('tabsKey')) {
        this.$store.commit('setOption', item.tabsKey)
        var temp = this.$store.getters.getOption
        if (temp.length > 0) {
          if (item.hasOwnProperty('options')) {
            item.options = item.options.concat(temp)
          } else {
            this.$set(item, 'options', temp)
          }
        }
      } else if (item.type == 'dateRangePicker') {
        this.$set(this.formData.rules, item.key, [])
        if (item.hasOwnProperty('rangeMethod')) {
          this.formData.rules[item.key].push(
            {validator: item.rangeMethod, trigger: 'change'}
          )
        } else {
          this.formData.rules[item.key].push(
            {validator: this.dateRangeReg, trigger: 'change'}
          )
        }
        if (item.hasOwnProperty('required')) {
          switch (item.required) {
            case 0: break
            case 1: this.formData.rules[item.key].push(
                      {required: true, message: '必填项', trigger: 'change'},
                      {validator: this.dateRangeRequired1, trigger: 'change'}
                    )
                    break
            case 2: this.formData.rules[item.key].push(
                      {required: true, message: '必填项', trigger: 'change'},
                      {validator: this.dateRangeRequired2, trigger: 'change'}
                    )
                    break
            case 3: this.formData.rules[item.key].push(
                      {required: true, message: '必填项', trigger: 'change'},
                      {validator: this.dateRangeRequired3, trigger: 'change'}
                    )
                    break
          }
        }
        /* this.$set(this.formData.rules, item.key1, [])
        this.$set(this.formData.rules, item.key2, [])
        this.formData.rules[item.key1].push(
          {validator: this.dateRangeReg, trigger: 'blur'}
        )
        this.formData.rules[item.key2].push(
          {validator: this.dateRangeReg, trigger: 'blur'}
        ) */
      }
    })
    if (this.formData.hasOwnProperty('keys')) {
      this.formData.keys.forEach(key => {
        if (this.formData.key != key) {
          this.formData.rules[key].push({validator: this.uniqueKey, trigger: 'blur'})
        }
      })
    }
    if (this.formData.hasOwnProperty('groupKey')) {
      let typeObj = {}
      let _this = this
      let ruleEvent = {}
      this.formData.groupKey.forEach(item => {
        typeObj = _this.formData.formData.filter(function (obj) {
          return obj.key == item
        })
        if (typeObj[0].type == 'select' || typeObj[0].type == 'tabs' || typeObj[0].type == 'casc') {
          ruleEvent[item] = 'change'
        } else {
          ruleEvent[item] = 'blur'
        }
        if (!this.formData.rules.hasOwnProperty(item)) {
          this.$set(this.formData.rules, item, [])
        }
        this.formData.rules[item].push(
          {validator: this.uniqueGroupKey, trigger: ruleEvent[item]}
        )
      })
    }
  },
  methods: {
    handleToUpper (item, event) {
      if (item.toUpper) {
        this.editData[item.key] = this.editData[item.key].toUpperCase()
      }
    },
    handleChange (file, fileList) {
      if (!this.fileItem.multiple) {
        this.$refs.upload[0].clearFiles()
        this.fileList = [file]
      } else {
        this.fileList = fileList
      }
      if (this.fileList.length > 0) {
        this.$delete(this.rules, this.fileItem.key)
        for (let x = 0; x < this.$refs['ruleForm'].fields.length; x++) {
          if (this.$refs['ruleForm'].$data.fields[x].prop == this.fileItem.key) {
            this.$refs['ruleForm'].$data.fields[x].validateState = 'success'
            this.$refs['ruleForm'].$data.fields[x].validateMessage = ''
            break
          }
        }
      } else if (this.fileList.length <= 0 && this.fileItem.hasOwnProperty('required') && this.fileItem.required) {
        this.$set(this.rules, this.fileItem.key, this.requiredArr)
      }
      this.$refs['ruleForm'].validateField(this.fileItem.key)
      // 首先判断是否是图片
      if (!/image\/\w+/.test(file.raw.type)) {
        this.showError('上传', '请上传图片 !')
      }
    },
    handleRemove (file, fileList) {
      if (!this.fileItem.multiple) {
        this.$refs.upload[0].clearFiles()
        this.fileList = []
      } else {
        this.fileList = fileList
      }
      if (this.fileList.length > 0) {
        this.$delete(this.rules, this.fileItem.key)
        for (let x = 0; x < this.$refs['ruleForm'].fields.length; x++) {
          if (this.$refs['ruleForm'].$data.fields[x].prop == this.fileItem.key) {
            this.$refs['ruleForm'].$data.fields[x].validateState = 'success'
            this.$refs['ruleForm'].$data.fields[x].validateMessage = ''
            break
          }
        }
      } else if (this.fileList.length <= 0 && this.fileItem.hasOwnProperty('required') && this.fileItem.required) {
        this.$set(this.rules, this.fileItem.key, this.requiredArr)
      }
      this.$refs['ruleForm'].validateField(this.fileItem.key)
    },
    handleChange2 (file, fileList) {
      if (!this.fileItem.multiple) {
        this.$refs.upload[0].clearFiles()
        this.fileList = [file]
      } else {
        this.fileList = fileList
      }
      if (this.fileList.length > 0) {
        this.$delete(this.rules, this.fileItem.key)
        for (let x = 0; x < this.$refs['ruleForm'].fields.length; x++) {
          if (this.$refs['ruleForm'].$data.fields[x].prop == this.fileItem.key) {
            this.$refs['ruleForm'].$data.fields[x].validateState = 'success'
            this.$refs['ruleForm'].$data.fields[x].validateMessage = ''
            break
          }
        }
      } else if (this.fileList.length <= 0 && this.fileItem.hasOwnProperty('required') && this.fileItem.required) {
        this.$set(this.rules, this.fileItem.key, this.requiredArr)
      }
      this.$refs['ruleForm'].validateField(this.fileItem.key)
    },
    itemChangeHandle (item, method) {
      if (method) {
        method(this.editData[item.key], param => {
          if (param) {
            if (Array.isArray(param)) {
              param.forEach(item => {
                this.$set(this.editData, item.key, item.value)
              })
            } else {
              this.$set(this.editData, param.key, param.value)
            }
          }
        })
      }
    },
    itemTabsChangeHandle (item, method) {
      if (method) {
        method(this.editData[item.key], param => {
          if (param) {
            if (Array.isArray(param)) {
              param.forEach(item => {
                this.$set(this.editData, item.key, item.value)
              })
            } else {
              this.$set(this.editData, param.key, param.value)
            }
          }
        })
      }
    },
    /* handleFilterMethod (query, item) {
      return item.label.indexOf(query) > -1
    }, */
    handleCascChange (item, method) {
      if (method) {
        method(this.editData[item.key], param => {
          if (param) {
            this.editData[param.key] = param.value
          }
        })
      }
    },
    treeButtonChange (item) {
      if (item.selectAll) {
        this.$refs['tree' + item.key][0].setCheckedKeys(_.map(item.options, item.itemKey))
      } else {
        this.$refs['tree' + item.key][0].setCheckedKeys([])
      }
    },
    uniqueGroupKey (rule, value, callback) {
      if (this.uniqueCount > 0) {
        this.uniqueCount = 0
        callback()
      } else {
        let data = {}
        let count = 0
        let _this = this
        let result = true
        for (let i = 0; i < _this.formData.groupKey.length; i++) {
          if (!_this.editData[_this.formData.groupKey[i]]) {
            result = false
            break
          } else {
            _this.$set(data, _this.formData.groupKey[i], _this.editData[_this.formData.groupKey[i]])
            let same = _this.formData.formData.filter((obj) => {
              return obj.key == _this.formData.groupKey[i]
            })
            if (_this.editData[_this.formData.groupKey[i]] != same[0].value) {
              count++
            }
          }
        }
        if (count > 0 && result) {
          setTimeout(() => {
            queryAll(this.formData.groupKeyUrl, data).then(response => {
              if (response.data.code == 0) {
                if (response.data.data.length > 0) {
                  this.formData.groupKey.forEach(item => {
                    if (item != rule.field) {
                      for (let x = 0; x < this.$refs['ruleForm'].fields.length; x++) {
                        if (this.$refs['ruleForm'].$data.fields[x].prop == item) {
                          this.$refs['ruleForm'].$data.fields[x].validateState = 'error'
                          this.$refs['ruleForm'].$data.fields[x].validateMessage = '当前组合编号已存在'
                          break
                        }
                      }
                    }
                    /* for (let x = 0; x < this.formData.formData.length; x++) {
                      if (this.formData.formData[x].key == item) {
                        this.formData.formData[x].error = '当前组合编号已存在'
                        break
                      }
                    } */
                  })
                  callback(new Error('当前组合编号已存在'))
                } else {
                  this.formData.groupKey.forEach(item => {
                    if (item != rule.field) {
                      this.uniqueCount++
                      this.$refs['ruleForm'].validateField(item)
                    }
                  })
                  this.uniqueCount = 0
                  callback()
                }
              } else {
                callback(new Error('请求失败'))
              }
            })
          }, 200)
        } else {
          this.formData.groupKey.forEach(item => {
            if (item != rule.field) {
              this.uniqueCount++
              this.$refs['ruleForm'].validateField(item)
            }
          })
          this.uniqueCount = 0
          callback()
        }
      }
    },
    dateRangeReg (rule, value, callback) {
      let same = this.formData.formData.find((obj) => {
        return obj.key == rule.field
      })
      if (value.hasOwnProperty(same.key1) && value.hasOwnProperty(same.key2)) {
        if (value[same.key1] && value[same.key2]) {
          if (value[same.key1] > value[same.key2]) {
            callback(new Error(same.regInfo ? same.regInfo : '开始时间必须小于等于结束时间'))
          }
        }
      }
      callback()
      /* let _this = this
      for (let i = 0; i < _this.formData.formData.length; i++) {
        if (_this.formData.formData[i].type == 'dateRangePicker') {
          if (_this.formData.formData[i].key1 == rule.field || _this.formData.formData[i].key2 == rule.field) {
            let start = _this.editData[_this.formData.formData[i].key1]
            let end = _this.editData[_this.formData.formData[i].key2]
            if (start && end) {
              if (start >= end) {
                callback(new Error('开始时间必须小于结束时间'))
              }
            }
          }
        }
      }
      callback() */
    },
    dateRangeRequired1 (rule, value, callback) {
      let same = this.formData.formData.find((obj) => {
        return obj.key == rule.field
      })
      if (value.hasOwnProperty(same.key1)) {
        if (value[same.key1]) {
          callback()
        } else {
          callback(new Error(same.requiredInfo ? same.requiredInfo : '开始时间不能为空'))
        }
      } else {
        callback(new Error(same.requiredInfo ? same.requiredInfo : '开始时间不能为空'))
      }
    },
    dateRangeRequired2 (rule, value, callback) {
      let same = this.formData.formData.find((obj) => {
        return obj.key == rule.field
      })
      if (value.hasOwnProperty(same.key2)) {
        if (value[same.key2]) {
          callback()
        } else {
          callback(new Error(same.requiredInfo ? same.requiredInfo : '结束时间不能为空'))
        }
      } else {
        callback(new Error(same.requiredInfo ? same.requiredInfo : '结束时间不能为空'))
      }
    },
    dateRangeRequired3 (rule, value, callback) {
      let same = this.formData.formData.find((obj) => {
        return obj.key == rule.field
      })
      if (value.hasOwnProperty(same.key1) && value.hasOwnProperty(same.key2)) {
        if (value[same.key1] && value[same.key2]) {
          callback()
        } else {
          callback(new Error(same.requiredInfo ? same.requiredInfo : '开始时间/结束时间均不能为空'))
        }
      } else {
        callback(new Error(same.requiredInfo ? same.requiredInfo : '开始时间/结束时间均不能为空'))
      }
    },
    handleOpen () {
      let title = this.formData.title
      if (title != '详情') {
        // 复制规则
        this.rules = Object.assign({}, this.formData.rules)
      } else {
        this.rules = {}
      }
      this.defaultChecked = []
      this.$nextTick(() => {
        if (this.$refs.hasOwnProperty('ruleForm')) {
          this.$refs['ruleForm'].clearValidate()
        }
      })
      this.formData.formData.forEach((item, index) => {
        if (item.type == 'upload' || item.type == 'uploadFile') {
          this.fileItem = JSON.parse(JSON.stringify(item))
          if (this.fileItem.hasOwnProperty('required') && this.fileItem.required) {
            if ((title != '新增' && !item.value) || (title == '新增')) {
              this.$set(this.rules, item.key, this.requiredArr)
            }
          }
          if (item.type == 'upload') {
            this.$store.commit('setConfigValue', 'dfsUrl')
            this.dfsUrl = this.$store.getters.getConfigValue
          }
        }
        if (item.type == 'tabs') {
          switch (title) {
            case '新增': if (!item.defaultValue) {
              this.$set(this.editData, item.key, item.options[0].key)
            } else {
              this.$set(this.editData, item.key, item.defaultValue)
            }
            break
            case '编辑': this.$set(this.editData, item.key, item.value)
                        break
            case '详情': this.$set(this.editData, item.key, item.value)
                        break
            case '克隆': this.$set(this.editData, item.key, item.defaultValue)
                        break
          }
        } else if (item.type == 'date' || item.type == 'datetime') {
          switch (title) {
            case '新增': if (!item.defaultValue) {
              this.$set(this.editData, item.key, null)
            } else {
              this.$set(this.editData, item.key, item.defaultValue)
            }
            break
            case '编辑': this.$set(this.editData, item.key, item.value)
                        break
            case '详情': this.$set(this.editData, item.key, item.value)
                        break
            default: this.$set(this.editData, item.key, item.value)
                        break
          }
        } else if (item.type == 'select' || item.type == 'checkbox' || item.type == 'casc' || item.type == 'trans' || item.type == 'tree' || item.type == 'datetimerange' || item.type == 'slot') {
          if (title == '新增' || ((title == '编辑' || title == '详情') && !item.value)) {
            if (item.type == 'select' && !item.hasOwnProperty('multiple')) {
              this.$set(this.editData, item.key, item.defaultValue ? item.defaultValue : null)
            } else {
              this.$set(this.editData, item.key, [])
            }
          } else {
            this.$set(this.editData, item.key, item.value)
          }
          if (item.isHidden != true && item.hasOwnProperty('getOptions')) {
            var data = ''
            if (this.$refs[item.key] && item.type == 'select' && !item.hasOwnProperty('multiple')) {
              this.$refs[item.key][0].selectedLabel = this.editData[item.key]
              this.$refs[item.key][0].query = this.editData[item.key]
              this.$refs[item.key][0].cachedOptions.splice(0)
            }
            if (item.options) {
              item.options.splice(0)
            } else {
              this.$set(item, 'options', [])
            }
            if (item.hasOwnProperty('optionsQuery')) {
              data = item.optionsQuery
            }
            getQueryAll(data == '' ? `${item.getOptions}` : `${item.getOptions}/${data}`).then(response => {
              if (response.data.code == 0) {
                if (item.type == 'tree' || item.type == 'trans') {
                  if (item.selectButton) {
                    this.$set(item, 'selectAll', false)
                  }
                  if (item.filterButton) {
                    this.$set(item, 'filterAll', '')
                  }
                  if (item.defaultExpand) {
                    this.$set(item, 'defaultExpandArr', [])
                    response.data.data['all'].forEach(obj => {
                      if (obj.hasOwnProperty('children')) {
                        item.defaultExpandArr.push(obj[item.itemKey])
                      }
                    })
                  }
                  item.options = response.data.data['all']
                  if (title == '编辑' || title == '详情') {
                    this.editData[item.key] = response.data.data['selected']
                  }
                } else if ((title == '新增') && (item.type == 'casc') && item.defaultValue) {
                  item.options = response.data.data
                  this.editData[item.key] = [item.options[0][item.props.value]]
                  this.handleCascChange(item, item.change)
                } else if ((title == '新增') && (item.type == 'select') && item.default) {
                  item.options = response.data.data
                  if (item.hasOwnProperty('itemKey')) {
                    this.editData[item.key] = item.options[0][item.itemKey]
                  } else {
                    this.editData[item.key] = item.options[0]
                  }
                  this.handleCascChange(item, item.change)
                } else if (item.filterMethod) {
                  item.filterMethod({options: response.data.data, item: item}, arr => {
                    item.options = arr
                  })
                } else {
                  item.options = response.data.data
                }
              }
            })
          }
        } else if (item.type == 'dateRangePicker') {
          switch (title) {
            case '新增': if (item.hasOwnProperty('defaultValue')) {
                          this.$set(this.editData, item.key, item.defaultValue)
                          this.$set(this.editData, item.key1, item.defaultValue[item.key1])
                          this.$set(this.editData, item.key2, item.defaultValue[item.key2])
                        } else {
                          this.$set(this.editData, item.key, {})
                          this.$set(this.editData, item.key1, null)
                          this.$set(this.editData, item.key2, null)
                        }
                        break
            case '编辑': this.$set(this.editData, item.key, item.value)
                        this.$set(this.editData, item.key1, item.value[item.key1])
                        this.$set(this.editData, item.key2, item.value[item.key2])
                        break
            case '详情': this.$set(this.editData, item.key, item.value)
                        this.$set(this.editData, item.key1, item.value[item.key1])
                        this.$set(this.editData, item.key2, item.value[item.key2])
                        break
          }
        } else {
          switch (title) {
            case '新增': this.$set(item, 'value', null)
                        break
          }
          this.$set(this.editData, item.key, item.value)
        }
        // 添加disabled
        if (item.hasOwnProperty('disabled') && !item.hasOwnProperty('isDisabled')) {
          switch (title) {
            case '新增': item.disabled = false
                        break
            case '编辑': item.disabled = true
                        break
          }
        }
        if (item.hasOwnProperty('isDisabled')) {
          this.$set(item, 'disabled', true)
          if (!item.hasOwnProperty('holdRule')) {
            this.$delete(this.rules, item.key)
          }
        }
        // 清除所有hidden的rule
        if (item.hasOwnProperty('isHidden')) {
          if (item.isHidden) {
            this.$delete(this.rules, item.key)
          }
        }
        if (title == '编辑' || title == '重置密码') {
          // 添加主键disabled，同时删除主键校验
          if (item.key == this.formData.key) {
            this.$set(item, 'disabled', true)
            this.$delete(this.rules, this.formData.key)
          } else if (this.formData.hasOwnProperty('groupKey')) {
            if (this.formData.hasOwnProperty('groupKeyDisabled')) {
              this.formData.groupKeyDisabled.forEach(groupKeyItem => {
                if (item.key == groupKeyItem) {
                  this.$set(item, 'disabled', true)
                }
              })
            } else {
              this.formData.groupKey.forEach(groupKeyItem => {
                if (item.key == groupKeyItem) {
                  this.$set(item, 'disabled', true)
                  this.$delete(this.rules, groupKeyItem)
                }
              })
            }
          } else {
            if (this.formData.hasOwnProperty('clearRulesKey')) {
              // 添加其他disabled，同时删除其他校验
              this.formData.clearRulesKey.forEach(keys => {
                if (item.key == keys) {
                  this.$set(item, 'disabled', true)
                  this.$delete(this.rules, keys)
                }
              })
            }
          }
        }
      })
      if (this.formData.hasOwnProperty('queryAllUrl')) {
        let optionsKeyArr = [...new Set(_.compact(_.map(this.formData.formData, 'optionsKey')))]
        queryAll(this.formData.queryAllUrl, {key: optionsKeyArr.join()}).then(res => {
          if (res.data.code == 0) {
            for (let i = 0; i < this.formData.formData.length; i++) {
              if (this.formData.formData[i].hasOwnProperty('optionsKey')) {
                if (res.data.data.hasOwnProperty(this.formData.formData[i].optionsKey)) {
                  if (this.formData.formData[i].type == 'slot') {
                    this.$set(this.formData.formData[i].tabelFields[0], 'options', res.data.data[this.formData.formData[i].optionsKey])
                  } else {
                    this.$set(this.formData.formData[i], 'options', res.data.data[this.formData.formData[i].optionsKey])
                  }
                } else {
                  this.showError('获取' + this.formData.formData[i].label + '信息', '请重新尝试 !')
                }
              }
            }
          } else {
            this.showError('获取资源信息', '请重新尝试 !')
          }
        })
      }
    },
    httpRequest (file) {
      var reader = new FileReader()
      var _this = this
      reader.readAsDataURL(file.file)
      reader.onload = () => {
        const base = reader.result.split(',')[1]
        let arr = file.file.name.split('.')
        let filetype = arr[arr.length - 1]
        let imgdata = {
            base64fill: base,
            filelen: _this.fileList.length,
            filetype: filetype
        }
        let callback = (progress) => {
          _this.progress = progress
        }
        _this.showProgress = true
        dfsPost(_this.fileItem.action, imgdata, callback).then(res => {
          _this.editData[_this.fileItem.key] = res.data.filePath
          if (_this.formData.title == '新增') {
            _this.$emit('handleAdd', _this.editData)
          } else if (_this.formData.title == '编辑') {
            _this.$emit('handleEdit', _this.editData)
          } else if (_this.formData.title == '重置密码') {
            _this.$emit('handleReset', _this.editData)
          } else if (_this.formData.title == '修改密码') {
            _this.$emit('handlePwd', _this.editData)
          }
          _this.fileList = []
        }).catch(err => {
          _this.formData.loading = false
          _this.showError('上传文件', err)
          _this.showProgress = false
        })
      }
    },
    handleSave () {
      if (!['新增', '编辑', '重置密码', '修改密码', '克隆'].includes(this.formData.title)) {
        this.$emit('handleOther', this.editData)
      } else {
        let _that = this
        this.$set(this.formData, 'loading', true)
        for (let i = 0; i < this.formData.formData.length; i++) {
          if (this.formData.formData[i].hasOwnProperty('hidden') && this.formData.formData[i].hidden) {
            if (!_.isNumber(this.editData[this.formData.formData[i].key])) {
              this.editData[this.formData.formData[i].key] = null
            }
            this.$delete(this.rules, this.formData.formData[i].key)
          }
        }
        let that = this
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            for (let i = 0; i < this.formData.formData.length; i++) {
              if (this.formData.formData[i].hasOwnProperty('hidden') && this.formData.formData[i].hidden) {
              } else if (this.formData.formData[i].isHidden == false) {
                if (this.formData.formData[i].type == 'tree') {
                  if (this.formData.formData[i].hasOwnProperty('saveKey')) {
                    this.editData[this.formData.formData[i].saveKey] = this.$refs['tree' + this.formData.formData[i].key][0].getCheckedKeys()
                    this.$delete(this.editData, this.formData.formData[i].key)
                  } else {
                    this.editData[this.formData.formData[i].key] = [].concat(this.$refs['tree' + this.formData.formData[i].key][0].getCheckedKeys(), this.$refs['tree' + this.formData.formData[i].key][0].getHalfCheckedKeys())
                  }
                } else if (this.formData.formData[i].type == 'datetimerange' || this.formData.formData[i].type == 'daterange') {
                  if (this.formData.formData[i].hasOwnProperty('dateRange')) {
                    this.formData.formData[i].dateRange.forEach((item, index) => {
                      this.$set(this.editData, item, this.editData[this.formData.formData[i].key][index])
                    })
                  }
                } else if (this.formData.formData[i].type == 'casc') {
                  if (this.formData.formData[i].hasOwnProperty('saveKey')) {
                    let arr = this.editData[this.formData.formData[i].key]
                    this.editData[this.formData.formData[i].saveKey] = arr[arr.length - 1] || null
                    this.$delete(this.editData, this.formData.formData[i].key)
                  }
                } else if (this.formData.formData[i].type == 'select' && this.formData.formData[i].multiple) {
                  if (this.formData.formData[i].hasOwnProperty('saveKey')) {
                    let arr = this.editData[this.formData.formData[i].key]
                    this.editData[this.formData.formData[i].saveKey] = arr.join(',')
                  }
                } else if (this.formData.formData[i].type == 'slot') {
                  if (this.formData.formData[i].hasOwnProperty('saveKey')) {
                    if (this.formData.formData[i].hasOwnProperty('tempArr')) {
                      this.editData[this.formData.formData[i].saveKey] = this.formData.formData[i].tempArr
                    } else {
                      let arr = this.editData[this.formData.formData[i].key]
                      this.editData[this.formData.formData[i].saveKey] = arr
                      this.$delete(this.editData, this.formData.formData[i].key)
                    }
                  }
                } else if (this.formData.formData[i].type == 'select' && this.formData.formData[i].hasOwnProperty('valueKey')) {
                  if (typeof (this.editData[_that.formData.formData[i].key]) == 'object') {
                    this.editData[this.formData.formData[i].key] = this.editData[this.formData.formData[i].key][this.formData.formData[i].itemKey]
                  }
                }
              }
            }
            this.clearTransferQuery()
            if (this.fileItem && this.fileList.length > 0) {
              this.$refs.upload[0].submit()
            } else {
              if (this.formData.title == '新增') {
                this.$emit('handleAdd', this.editData)
              } else if (this.formData.title == '编辑') {
                this.$emit('handleEdit', this.editData)
              } else if (this.formData.title == '重置密码') {
                this.$emit('handleReset', this.editData)
              } else if (this.formData.title == '修改密码') {
                this.$emit('handlePwd', this.editData)
              } else if (this.formData.title == '克隆') {
                this.$emit('handleClone', this.editData)
              }
            }
          } else {
            this.formData.loading = false
            return false
          }
        })
      }
    },
    handleClose () {
      if (!['新增', '编辑', '详情', '重置密码', '修改密码', '克隆'].includes(this.formData.title)) {
        this.$emit('handleOtherCancle')
      } else {
        this.clearTransferQuery()
        this.$nextTick(() => {
          if (this.$refs.hasOwnProperty('ruleForm')) {
            this.fileList = []
            if (this.fileItem) {
              this.$refs.upload[0].abort()
              this.$refs.upload[0].clearFiles()
            }
            this.$refs['ruleForm'].clearValidate()
          }
        })
        this.formData.visible = false
        this.progress = 0
        this.showProgress = false
      }
    },
    clearTransferQuery () {
      var event = document.createEvent('Event')
      event.initEvent('mouseenter', true, true)
      var transfers = document.getElementsByClassName('el-transfer')
      _.forEach(transfers, (dom) => {
        dom.querySelectorAll('.el-input__icon')[0].dispatchEvent(event)
        dom.querySelectorAll('.el-input__icon')[0].click()
        dom.querySelectorAll('.el-input__icon')[1].dispatchEvent(event)
        dom.querySelectorAll('.el-input__icon')[1].click()
      })
    },
    treeFilterChange (key, value) {
      this.$refs['tree' + key][0].filter(value)
    },
    filterNode (value, data) {
      if (!value) {
        return true
      }
      return data.text.indexOf(value) !== -1
    }
  }
}
</script>

<style>
.dialog-form-edit .el-dialog {
  width: 30%;
  min-width: 480px;
}
.dialog-form-edit .el-dialog__wrapper {
  overflow: hidden;
}
.dialog-form-edit .el-dialog__body {
  overflow-x: hidden;
  overflow-y: auto;
}
.dialog-form-edit .el-form {
  overflow-y: auto;
  height: calc(100% - 20px);
  margin-top: 20px;
}
.twiceCol .el-form-item {
  float: left;
  width: 45%;
  margin-right: 5%;
  margin-bottom: 0;
}
.dialog-form-edit .el-form-item.auto-width {
  width: 95% !important;
}
.margin-bottom-slow .el-form-item__content {
  margin-bottom: 14px !important;
}
.el-form-item.whole-width {
  width: 100% !important;
}
.el-form-item.whole-width .el-form-item__content {
  margin-bottom: 0 !important;
}
.dialog-form-edit .el-form-item.auto-margin {
  margin-right: 50%;
}
.dialog-form-edit .el-form-item.auto-width .el-cascader {
  width: 100% !important;
}
.dialog-form-edit .el-form-item__label {
  font-size: 12px;
  padding: 0
}
.dialog-form-edit .dialog-form-edit-footer {
  position: fixed;
  right: 2%;
  bottom: 2%;
}
.dialog-form-edit .el-form-item__error {
  /* position: relative; */
  position: absolute;
  color: #d9415a;
  /* top: 4px; */
  left: 16px;
}
.tree-select-all {
  display: inline;
  position: absolute;
  top: -33px;
  right: 5px;
}
.tree-filter-all {
  display: inline;
  position: absolute;
  top: 10px;
  right: 10px;
}
.tree-filter .el-tree {
  padding-top: 48px !important;
}
</style>
