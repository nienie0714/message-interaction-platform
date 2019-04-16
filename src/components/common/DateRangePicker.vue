<template>
  <!-- <div class="date-range-picker">
    <el-form-item :label="dateRange.label1" :prop="dateRange.key1">
      <el-date-picker v-model="editData[dateRange.key1]" :type="dateRange.dateType"
      :format="dateRange.format" :placeholder="dateRange.placeholder" @change="handleDateChange"></el-date-picker>
    </el-form-item>
    <el-form-item :label="dateRange.label2" :prop="dateRange.key2">
      <el-date-picker v-model="editData[dateRange.key2]" :type="dateRange.dateType"
      :format="dateRange.format" :placeholder="dateRange.placeholder" @change="handleDateChange"></el-date-picker>
    </el-form-item>
  </div> -->
  <div>
    <div class="date-range-picker" v-if="dateRange.dateType == 'time'">
        <el-time-picker v-model="editData[dateRange.key1]" style="width: 47%;" :value-format="dateRange.valueFormat"
        :format="dateRange.format" :placeholder="'请选择' + dateRange.label1" @change="handleDateChange"></el-time-picker>
        <span style="width: 4%; display: inline-block;"></span>
        <el-time-picker v-model="editData[dateRange.key2]" style="width: 47%;" :value-format="dateRange.valueFormat"
        :format="dateRange.format" :placeholder="'请选择' + dateRange.label2" @change="handleDateChange"></el-time-picker>
    </div>
    <div class="date-range-picker" v-else>
      <el-date-picker v-model="editData[dateRange.key1]" :type="dateRange.dateType" style="width: 47%;" :value-format="dateRange.valueFormat"
      :format="dateRange.format" :placeholder="'请选择' + dateRange.label1" :picker-options="dateRange.hasOwnProperty('min') ? pickerOpt : {}" @change="handleDateChange"></el-date-picker>
        <span style="width: 4%; display: inline-block;"></span>
        <el-date-picker v-model="editData[dateRange.key2]" :type="dateRange.dateType" style="width: 47%;" :value-format="dateRange.valueFormat"
        :format="dateRange.format" :placeholder="'请选择' + dateRange.label2" :picker-options="dateRange.hasOwnProperty('max') ? pickerOpt : {}" @change="handleDateChange"></el-date-picker>
    </div>
  </div>
</template>

<script>
export default {
  props: ['dateRange', 'editData'],
  data () {
    return {
      pickerOpt: {
        disabledDate: (time) => {
          return (time.getTime() < new Date(this.dateRange.min).getTime() - 8.64e7) || (time.getTime() > new Date(this.dateRange.max).getTime())
        }
      }
    }
  },
  methods: {
    handleDateChange (event) {
      this.editData[this.dateRange.key] = {}
      this.$set(this.editData[this.dateRange.key], this.dateRange.key1, this.editData[this.dateRange.key1])
      this.$set(this.editData[this.dateRange.key], this.dateRange.key2, this.editData[this.dateRange.key2])
    }
  }
}
</script>
