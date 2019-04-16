<template>
    <el-col v-if="!data.hidden" :span="data.span">
      <span v-if="data.p">{{ data.p }}</span>
      <!-- 输入框 -->
      <el-input v-if="data.type == 'input'" v-model.trim="data.value" :placeholder="data.inputText?data.inputText:''" :readonly="data.readonly" :maxlength="data.maxlength"
      @change="valueChange(data)" @keyup.enter.native="$emit('keyupEnter')"><!--  suffix-icon="el-icon-search" -->
        <i v-if="data.icon != 'none'" slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <!-- 下拉框 -->
      <el-select v-if="data.type == 'select'" v-model="data.value" :placeholder="data.inputText?data.inputText:''"
      :multiple="data.multiple" :readonly="data.readonly" :remote="data.remote" :remote-method="data.remoteMethod"
      :filterable="data.filterable" :clearable="data.clearable ? data.clearable : true" :default-first-option="data.filterable"
      :change="valueChange(data)">
        <el-option
        v-for="item in data.options"
        :key="data.optKey?item[data.optKey]:item"
        :label="data.optLabel?item[data.optLabel]:item"
        :value="data.optKey?item[data.optKey]:item">
        </el-option>
      </el-select>
      <!-- 标签按钮 -->
      <el-radio-group v-if="data.type == 'tabs'" v-model="data.value" :size="data.size" style="" :change="valueChange(data)">
        <el-radio-button v-for="item in data.options" :key="item.key" :label="item.key">{{ item.value }}</el-radio-button>
      </el-radio-group>
      <!-- 日期选择器 -->
      <!-- year/month/date/dates/week/datetime/datetimerange/daterange -->
      <!-- yyyy-年/M、MM-月/W、WW-周/dd-日/HH-24小时制/hh-12小时制、须和A、a-am、PM使用/mm-分/ss-秒/timestamp-时间戳：组件绑定类型为number -->
      <el-date-picker v-if="data.type == 'year' || data.type == 'month' || data.type == 'date' || data.type == 'dates' || data.type == 'week' || data.type == 'datetime' || data.type == 'datetimerange' || data.type == 'daterange'"
      v-model="data.value" :type="data.type" :placeholder="data.inputText?data.inputText:''" :editable="data.editable" :clearable="data.clearable"
      :default-value="data.defaultDate" :format="data.format" :value-format="data.valueFormat" :readonly="data.readonly" :disabled="data.disabled"></el-date-picker>
    </el-col>
</template>

<script>
import {queryAll} from '../../api/base.js'

export default {
  props: ['data'],
  data () {
    return {
      selectedValue: ''
    }
  },
  created () {
    if (this.data.type == 'select') {
      if (this.data.hasOwnProperty('getOptions')) {
        let query = {}
        if (this.data.hasOwnProperty('optionsQuery')) {
          query = this.data.optionsQuery
        }
        queryAll(this.data.getOptions, query).then(response => {
          if (response.data.code == 0) {
            if (this.data.hasOwnProperty('options')) {
              this.data.options = this.data.options.concat(response.data.data)
            } else {
              this.$set(this.data, 'options', response.data.data)
            }
          }
        })
      }
    }
  },
  methods: {
    valueChange (data) {
      if (data.toUpper) {
        data.value = data.value.toUpperCase()
      }
      this.$emit('change', {
        data: this.data,
        selectedValue: this.selectedValue
      })
    }
  }
}
</script>
