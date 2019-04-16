<template>
  <div class="flight-gantt-view gantt-view">
    <el-container direction="vertical">
      <div class="header-menu" ref="homeHeader">
        <el-header style="height: 80px; font-size: 12px">
          <div class="gantt-header">
            <div class="header-title">
              <div class="gantt-logo"></div>
              <span class="gantt-title">{{flightNo + '航班保障详情'}}</span>
            </div>
            <div class="header-update-div">
              <div>最后更新时间：</div>
              <div>{{lastUpdateTime}}</div>
              <div class="header-refrush">
                <div class="img-refrush" @click="queryDataMethod"></div>
              </div>
            </div>
          </div>
        </el-header>
      </div>
      <el-main class="home-top-main flight-gantt-top-main">
        <el-container class="flight-gantt-top-container">
          <div class="table-container container-left">
            <el-row :gutter="20">
              <el-col :span="2">
                <div class="top-title">机型</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.aircraftType)?data.viewDynamicAircraft.aircraftType:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="2">
                <div class="top-title">属性</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.attrCn)?data.viewDynamicAircraft.attrCn:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="2">
                <div class="top-title">执行日期</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.execDate)?data.viewDynamicAircraft.execDate:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="2">
                <div class="top-title">机位</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.stand)?data.viewDynamicAircraft.stand:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="2">
                <div class="top-title">登机口</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.gate)?data.viewDynamicAircraft.gate:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="6">
                <div class="top-title">航线</div>
                <div class="top-cont">{{(data && data.viewDynamicAircraft && data.viewDynamicAircraft.routeCn)?data.viewDynamicAircraft.routeCn:'&nbsp;'}}</div>
              </el-col>
            </el-row>
            <div class="bottom-table">
              <el-row :gutter="24" class="bottom-table-title">
                <el-col :span="2">
                  <div>进/出港</div>
                </el-col>
                <el-col :span="2">
                  <div>航班号</div>
                </el-col>
                <el-col :span="2">
                  <div>计划起飞</div>
                </el-col>
                <el-col :span="2">
                  <div>预计起飞</div>
                </el-col>
                <el-col :span="3">
                  <div>实际起飞</div>
                </el-col>
                <el-col :span="2">
                  <div>计划到达</div>
                </el-col>
                <el-col :span="2">
                  <div>预计到达</div>
                </el-col>
                <el-col :span="3">
                  <div>实际到达</div>
                </el-col>
                <el-col :span="2">
                  <div>进展状态</div>
                </el-col>
                <el-col :span="2">
                  <div>异常状态</div>
                </el-col>
                <el-col :span="2">
                  <div>异常原因</div>
                </el-col>
              </el-row>
              <el-row :gutter="24" class="bottom-table-cont">
                <el-col :span="2">
                  <div>进港</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA && data.flightA.flightNo) ? data.flightA.flightNo : '&nbsp;'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.prevDepTimeS) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.prevDepTimeE) : '—:—'}}</div>
                </el-col>
                <el-col :span="3">
                  <div :class="data && data.flightA && data.flightA.prevDepTimeA ? 'text-dec' : ''">{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.prevDepTimeA) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.sta) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.eta) : '—:—'}}</div>
                </el-col>
                <el-col :span="3">
                  <div :class="data && data.flightA && data.flightA.ata ? 'text-dec' : ''">{{(data && data.flightA) ? this.formatterTimeOfHM(data.flightA.ata) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightA && data.flightA.progressStatusCn) ? data.flightA.progressStatusCn : '&nbsp;'}}</div>
                </el-col>
                <el-col :span="2">
                  <div class="text-red">{{(data && data.flightA && data.flightA.abnormalStatusCn) ? data.flightA.abnormalStatusCn : '&nbsp;'}}</div>
                </el-col>
                <el-col :span="2">
                  <div class="text-red">{{(data && data.flightA && data.flightA.abnormalReasonCn) ? data.flightA.abnormalReasonCn : '&nbsp;'}}</div>
                </el-col>
              </el-row>
              <el-row :gutter="24" class="bottom-table-cont">
                <el-col :span="2">
                  <div>出港</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD && data.flightD.flightNo) ? data.flightD.flightNo : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.std) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.etd) : '—:—'}}</div>
                </el-col>
                <el-col :span="3">
                  <div :class="data && data.flightD && data.flightD.atd ? 'text-dec' : ''">{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.atd) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.sta) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.eta) : '—:—'}}</div>
                </el-col>
                <el-col :span="3">
                  <div :class="data && data.flightD && data.flightD.ata ? 'text-dec' : ''">{{(data && data.flightD) ? this.formatterTimeOfHM(data.flightD.ata) : '—:—'}}</div>
                </el-col>
                <el-col :span="2">
                  <div>{{(data && data.flightD && data.flightD.progressStatusCn) ? data.flightD.progressStatusCn : '&nbsp;'}}</div>
                </el-col>
                <el-col :span="2">
                  <div class="text-red">{{(data && data.flightD && data.flightD.abnormalStatusCn) ? data.flightD.abnormalStatusCn : '&nbsp;'}}</div>
                </el-col>
                <el-col :span="2">
                  <div class="text-red">{{(data && data.flightD && data.flightD.abnormalReasonCn) ? data.flightD.abnormalReasonCn : '&nbsp;'}}</div>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="table-container container-right"></div>
        </el-container>
        <el-container class="table-container flight-gantt-bottom-container">
          <el-header>
            <div class="table-header">
              <div class="table-header-title">
                <img :src="require('@img/title_deco.png')"/>
                <span class="header-title">航班保障</span>
                <span>
                  <div class="dot-font">
                    <div class="dot-color-1"></div>
                    <span>计划</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-4_1"></div>
                    <span>保障正常</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-3"></div>
                    <span>保障超时</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-2"></div>
                    <span>保障异常</span>
                  </div>
                </span>
              </div>
              <div class="table-header-button">
                <div class="ctrl-f-query" @click="resetMarkLine"></div>
                <el-radio-group v-model="flightGanttSelect" size="small" @change="changeFlightGanttSelect">
                  <el-radio-button label="gantt">保障甘特图</el-radio-button>
                  <el-radio-button label="table">任务列表</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-header>
          <el-main style="overflow: hidden;">
            <div v-show="flightGanttSelect == 'gantt'" :style="flightGanttStyle">
              <div id="flightGantt" class="flight-gantt" :style="flightGanttStyle"></div>
            </div>
            <div v-show="flightGanttSelect == 'table'" id="flightGanttTable">
              <Table-view :tableData="tableData" ref="basicTable">
                <template slot="slot-scope" slot-scope="scope">
                  <div style="display: flex; justify-content: center;">
                    <div>{{scope.field.hasOwnProperty('formatter') ? formatterMinScope(scope.row[scope.field.prop.split('/')[0]]) : scope.row[scope.field.prop.split('/')[0]]}}</div>
                    /
                    <div :class="timeStyleCss(scope)">{{scope.field.hasOwnProperty('formatter') ? formatterMinScope(scope.row[scope.field.prop.split('/')[1]]) : scope.row[scope.field.prop.split('/')[1]]}}</div>
                  </div>
                </template>
              </Table-view>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import baseMixin from '@/components/mixin/baseMixin'
import webSocketMixin from '@/components/mixin/webSocketMixin'
import TableView from '@/components/common/BaseTableView'
import _ from 'lodash'
import { postData } from '@/api/base'

export default {
  components: {
    TableView
  },
  mixins: [baseMixin, webSocketMixin],
  data () {
    return {
      timeInt: 10 * 1000,
      lastUpdateTime: '',
      flightGanttStyle: {
        width: 'calc(100%)',
        height: 'calc(100%)'
        // height: Math.floor((window.innerHeight - 165) / 50) * 50 - 10 + 'px'
      },
      queryUrl: 'taskscheduling/vue/gantt/task',
      queryData: {
        dynamicFlightIdA: null,
        dynamicFlightIdD: null
      },
      taskArr: [],
      data: [],
      flightNo: '',
      flightGanttSelect: 'gantt',
      dataList: [],
      yList: [],
      dataZoomData: [null, null],
      ganttEl: null,
      flightGantt: null,
      canvasCtx: null,
      dRectList: [],
      dRectStatus: false,
      cat: null,
      xTickLength: 20,
      divTop: 7,
      divHeight: 22,
      color: {
        unexecuted: '#7eb3d6',
        finished: '#03a786',
        executing: '#03a786',
        overlop: '#e65069'
      },
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
        key: 'dynamicTaskId',
        multipleSelection: [],
        isOperat: true,
        fields: [
          {prop: 'taskCn', label: '任务名称', fixed: true, hidden: false},
          {prop: 'distributer', label: '派发人', fixed: true, hidden: false},
          {prop: 'distribution', label: '保障单元/执行人', fixed: true, hidden: false},
          {prop: 'thisOperationCn', label: '当前进程', fixed: true, hidden: false},
          {prop: 'nextOperationCn', label: '下一进程', fixed: true, hidden: false},
          {prop: 'distributeTime', label: '派发时间', fixed: true, hidden: false, formatter: this.formatterMin},
          {prop: 'cancelTime', label: '撤销时间', fixed: true, hidden: false, formatter: this.formatterMin},
          {prop: 'rejectTime', label: '拒绝时间', fixed: true, hidden: false, formatter: this.formatterMin},
          {prop: 'receiveTime', label: '接受时间', fixed: true, hidden: false, formatter: this.formatterMin},
          {prop: 'firstOperationTime', label: '到位时间', fixed: true, hidden: false, formatter: this.formatterMin},
          {prop: 'beginTimeE/beginTimeA', label: '预计/实际开始', fixed: true, hidden: false, formatter: this.formatterMin, type: 'slotScope'},
          {prop: 'endTimeE/endTimeA', label: '预计/实际结束', fixed: true, hidden: false, formatter: this.formatterMin, type: 'slotScope'},
          {prop: 'costE/costA', label: '预计/实际时长(分)', fixed: true, hidden: false, type: 'slotScope', scopeCss: true},
          {prop: 'remark', label: '备注', fixed: false, hidden: false}
        ]
      }
    }
  },
  mounted () {
    // this.resGanttStyle.height = Math.floor((window.innerHeight - 175) / 50) * 50 + 'px'
    this.taskArr = this.$store.getters.getTaskColOption
    if (this.flightGanttSelect == 'gantt') {
      this.cat = this.$echarts
      this.ganttEl = document.getElementById('flightGantt')
      this.flightGantt = this.$echarts.init(this.ganttEl)
    } else {
      this.tableData.height = document.getElementById('flightGanttTable').clientHeight
    }
    this.$nextTick(() => {
        window.onresize = () => {
          if (this.flightGanttSelect == 'gantt') {
            var width = this.flightGantt.getOption()
            var opts = {
              width: 'auto',
              height: (this.yList.length > 0) && (this.ganttEl.clientHeight - 50 > this.yList.length * 50 - 10) ? this.yList.length * 50 - 10 : Math.floor((this.ganttEl.clientHeight) / 50) * 50
            }
            this.flightGantt.resize(opts)
            this.updateOption()
          } else {
            var targetTop2 = this.$refs.basicTable.$refs.baseTable.$el.querySelector('.el-table__body-wrapper').getBoundingClientRect().top
            this.tableData.height = window.innerHeight - targetTop2 + 21
          }
        }
      })
    var timer = setInterval(this.queryDataMethod, this.timeInt)
    this.queryDataMethod()
  },
  methods: {
    // 自定义websocket获取数据后操作
    customWsOnMessage (data) {
      if (data.type == 4 && data.Authorization == localStorage.getItem('token')) {
        this.queryDataMethod(true)
      }
    },
    queryDataMethod (flag) {
      this.$set(this.queryData, 'dynamicFlightIdA', JSON.parse(localStorage.getItem('flightGanttA')))
      this.$set(this.queryData, 'dynamicFlightIdD', JSON.parse(localStorage.getItem('flightGanttD')))
      postData(this.queryUrl, this.queryData).then(res => {
        if (res.data.code == 0) {
          var hour = this.newTime.getHours() < 10 ? `0${this.newTime.getHours()}` : this.newTime.getHours()
          var minite = this.newTime.getMinutes() < 10 ? `0${this.newTime.getMinutes()}` : this.newTime.getMinutes()
          var second = this.newTime.getSeconds() < 10 ? `0${this.newTime.getSeconds()}` : this.newTime.getSeconds()
          this.lastUpdateTime = `${hour}:${minite}:${second}`
          this.data = res.data.data
          this.tableData.data = this.data.task
          var targetTop2 = this.$refs.basicTable.$refs.baseTable.$el.querySelector('.el-table__body-wrapper').getBoundingClientRect().top
          this.tableData.height = window.innerHeight - targetTop2 + 21
          var flightNo = []
          if (this.data.flightA) {
            flightNo.push(this.data.flightA.flightNo)
          }
          if (this.data.flightD) {
            flightNo.push(this.data.flightD.flightNo)
          }
          this.flightNo = flightNo.join(' / ')
          if (this.flightGanttSelect == 'gantt') {
            this.updateOption(flag)
          }
        }
      })
    },
    changeFlightGanttSelect (value) {
      if (value == 'gantt') {
        this.updateOption(true)
      } else {
        var targetTop2 = this.$refs.basicTable.$refs.baseTable.$el.querySelector('.el-table__body-wrapper').getBoundingClientRect().top
        this.tableData.height = window.innerHeight - targetTop2 + 21
      }
    },
    timeStyleCss (scope) {
      var css = []
      if (scope.row[scope.field.prop.split('/')[1]] || scope.row[scope.field.prop.split('/')[1]] == 0) {
        css.push('text-dec')
      }
      if (scope.field.scopeCss && scope.row[scope.field.prop.split('/')[1]] > scope.row[scope.field.prop.split('/')[0]]) {
        css.push('time-over')
      }
      return css.join(' ')
    },
    compact (arr) {
      var tempArr = []
      arr.forEach(obj => {
        if (obj && !_.isEmpty(obj)) {
          tempArr.push(obj)
        }
      })
      return tempArr
    },
    setTextStyle (api, params, style) {
      var categoryIndex = api.value(0)
      var startTime = new Date(api.value(1))
      var endTime = new Date(api.value(2))
      var start = null
      var end = null
      var arr = _.filter(this.dataList, (item) => {
        return item.dynamicTaskId == api.value(3) && item.status != api.value(4)
      })
      if (_.isEmpty(arr)) {
        start = api.coord([api.value(1), categoryIndex])
        end = api.coord([api.value(2), categoryIndex])
      } else {
        if (api.value(1) < arr[0].value[1]) {
          start = api.coord([api.value(1), categoryIndex])
        } else {
          start = api.coord([arr[0].value[1], categoryIndex])
        }
        if (api.value(2) > arr[0].value[2]) {
          end = api.coord([api.value(2), categoryIndex])
        } else {
          end = api.coord([arr[0].value[2], categoryIndex])
        }
      }
      if (start[0] - 50 >= params.coordSys.x) {
        var obj1 = {
          type: 'text',
          name: api.value(3) + api.value(4) + 'start',
          info: startTime,
          style: {
            text: this.formatterTimeOfHM(startTime),
            x: start[0] - 50,
            y: start[1] - this.xTickLength - this.divTop + 10 + (['E', 'R'].includes(api.value(4)) ? 20 : 0),
            font: `normal normal 14px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
            fill: style.fill,
            stroke: style.fill
          },
          z2: 1
        }
      }
      if (end[0] + 10 >= params.coordSys.x) {
        var obj2 = {
          type: 'text',
          name: api.value(3) + api.value(4) + 'end',
          info: endTime,
          style: {
            text: this.formatterTimeOfHM(endTime),
            x: end[0] + 10,
            y: start[1] - this.xTickLength - this.divTop + 10 + (['E', 'R'].includes(api.value(4)) ? 20 : 0),
            font: `normal normal 14px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
            fill: style.fill,
            stroke: style.fill
          },
          z2: 1
        }
      }
      return this.compact([obj1, obj2])
    },
    setRejectStyle (api, params) {
      var arr = []
      if (api.value(4) == 'R') {
        var end = api.coord([api.value(2), api.value(0)])
        if (end[0] - 12 >= params.coordSys.x) {
          var obj = {
            type: 'image',
            name: api.value(3) + api.value(4),
            style: {
              image: '/static/img/tg_reject.png',
              x: end[0] - 12,
              y: end[1] - this.xTickLength - this.divTop + 8
            },
            z2: 3
          }
          arr.push(obj)
        }
      }
      return arr
    },
    resetMarkLine () {
      var dataZoomDataBatch = []
      if (this.dataZoomData[0]) {
        this.$delete(this.dataZoomData[0], 'start')
        this.$delete(this.dataZoomData[0], 'end')
        var startValue = null
        var endValue = null
        var timeRange = ((this.ganttEl.clientWidth - 105) / 10) * (60 * 1000)
        if (this.data.rangeTime.begin && this.data.rangeTime.end) {
          startValue = this.data.rangeTime.begin
          endValue = startValue + timeRange
        } else if (this.data.rangeTime.begin) {
          startValue = this.data.rangeTime.begin
          endValue = startValue + timeRange
        } else if (this.data.rangeTime.end) {
          endValue = this.data.rangeTime.end
          startValue = endValue - timeRange
        }
        this.dataZoomData[0].startValue = startValue
        this.dataZoomData[0].endValue = endValue
        dataZoomDataBatch.push(this.dataZoomData[0])
      }
      var params = {
        startValue: this.yList[0],
        endValue: this.yList[Math.floor((this.ganttEl.clientHeight - 40) / 50) - 1]
      }
      if (this.dataZoomData[1]) {
        if (this.dataZoomData[1].hasOwnProperty('start')) {
          this.$delete(this.dataZoomData[1], 'start')
          this.$delete(this.dataZoomData[1], 'end')
          dataZoomDataBatch.push(_.assign({dataZoomIndex: 2}, params))
        }
      }
      if (!_.isEmpty(dataZoomDataBatch)) {
        this.flightGantt.dispatchAction({
          type: 'dataZoom',
          batch: dataZoomDataBatch
        })
      }
    },
    updateOption (flag) {
      var yList = []
      var dataList = []
      var timeNow = this.newTime.getTime()
      this.data.task.forEach((item, index) => {
        yList.push(item.taskCn)
        var value = []
        var color = ''
        //            0预计, 1拒绝,  2实际, 3进行
        var statusArr = [false, false, false, false]
        var status = null
        statusArr[0] = item.beginTimeE && item.endTimeE
        statusArr[1] = item.rejectNum > 0 && item.rejectNum == item.distributeNum
        statusArr[2] = item.beginTimeA
        statusArr[3] = item.beginTimeA && !item.endTimeA
        // 预计任务块
        if (statusArr[0]) {
          status = 'E'
          if (statusArr[1]) {
            status = 'R'
          }
          value = [index, item.beginTimeE, item.endTimeE, item.dynamicTaskId, status]
          color = '#3e6681'
          dataList.push({
            dynamicTaskId: item.dynamicTaskId,
            name: item.taskCn,
            value: value,
            status: status,
            itemStyle: {
              color: color
            }
          })
        }
        // 实际任务块
        if (statusArr[2]) {
          if (statusArr[0]) {
            // 是否进行中
            if (statusArr[3]) {
              color = item.endTimeE + 60 * 1000 <= timeNow ? '#e65069' : (item.exceptionCount > 0 ? '#fdcf53' : '#03a786')
              status = 'D'
              value = [index, item.beginTimeA, timeNow, item.dynamicTaskId, status]
            } else {
              color = item.endTimeE + 60 * 1000 <= item.endTimeA ? '#e65069' : (item.exceptionCount > 0 ? '#fdcf53' : '#03a786')
              status = 'A'
              value = [index, item.beginTimeA, item.endTimeA, item.dynamicTaskId, status]
            }
          } else {
            // 是否进行中
            if (statusArr[3]) {
              color = item.exceptionCount > 0 ? '#fdcf53' : '#03a786'
              status = 'D'
              value = [index, item.beginTimeA, timeNow, item.dynamicTaskId, status]
            } else {
              color = item.exceptionCount > 0 ? '#fdcf53' : '#03a786'
              status = 'A'
              value = [index, item.beginTimeA, item.endTimeA, item.dynamicTaskId, status]
            }
          }
          dataList.push({
            dynamicTaskId: item.dynamicTaskId,
            name: item.taskCn,
            value: value,
            status: status,
            itemStyle: {
              color: color
            }
          })
        }
      })
      this.yList = yList
      this.dataList = dataList
      var dataZoomX = {}
      var dataZoomY = {}
      var startValue = null
      var endValue = null
      var min = null
      var max = null
      var timeRange = ((this.ganttEl.clientWidth - 105) / 10) * (60 * 1000)
      if (this.data.rangeTime.begin && this.data.rangeTime.end) {
        startValue = this.data.rangeTime.begin
        endValue = startValue + timeRange
        min = endValue - (endValue - startValue) / 2 - 12 * 3600 * 1000
        max = endValue - (endValue - startValue) / 2 + 12 * 3600 * 1000
      } else if (this.data.rangeTime.begin) {
        startValue = this.data.rangeTime.begin
        endValue = startValue + timeRange
        min = startValue - 11 * 3600 * 1000
        max = startValue + 13 * 3600 * 1000
      } else if (this.data.rangeTime.end) {
        endValue = this.data.rangeTime.end
        startValue = endValue - timeRange
        min = endValue - 13 * 3600 * 1000
        max = endValue + 11 * 3600 * 1000
      }
      var params = null
      if (!flag && this.dataZoomData[0]) {
        params = this.dataZoomData[0]
      } else {
        params = {
          startValue: startValue,
          endValue: endValue
        }
      }
      if (params.hasOwnProperty('start')) {
        this.$set(dataZoomX, 'start', params.start)
        this.$set(dataZoomX, 'end', params.end)
      } else {
        this.$set(dataZoomX, 'startValue', params.startValue)
        this.$set(dataZoomX, 'endValue', params.endValue)
      }
      params = null
      if (!flag && this.dataZoomData[1]) {
        params = this.dataZoomData[1]
      } else {
        params = {
          startValue: this.yList[0],
          endValue: this.yList[Math.floor((this.ganttEl.clientHeight - 40) / 50) - 1]
        }
      }
      if (params.hasOwnProperty('start')) {
        this.$set(dataZoomY, 'start', params.start)
        this.$set(dataZoomY, 'end', params.end)
      } else {
        this.$set(dataZoomY, 'startValue', params.startValue)
        this.$set(dataZoomY, 'endValue', params.endValue)
      }
      this.dRectList = []
      var option = {
        xAxis: [
          {
            name: '任务名称',
            nameLocation: 'start',
            nameGap: 25,
            nameTextStyle: {
              color: '#7a939e',
              fontSize: 14,
              verticalAlign: 'middle',
              align: 'center'
            },
            type: 'time',
            position: 'top',
            offset: 0,
            scale: true,
            min: min,
            max: max,
            minInterval: 5 * 60 * 1000,
            maxInterval: 5 * 60 * 1000,
            axisLabel: {
              color: '#fff',
              formatter: function (val, index) {
                var date = new Date(val)
                var hour = date.getHours()
                var minite = date.getMinutes()
                if (hour >= 0 && hour < 10) {
                  hour = `0${hour}`
                }
                if (minite >= 0 && minite < 10) {
                  minite = `0${minite}`
                }
                return `${hour}:${minite}`
              },
              margin: this.xTickLength + 10
            },
            axisTick: {
              inside: false,
              length: this.xTickLength,
              lineStyle: {
                color: '#fff',
                width: 1,
                type: 'solid'
              }
            },
            axisLine: {
              lineStyle: {
                color: 'transparent'
              }
            },
            splitLine: {
              show: false
            }
          },
          {
            type: 'time',
            position: 'top',
            offset: this.xTickLength / 2,
            scale: true,
            min: min,
            max: max,
            minInterval: 1 * 60 * 1000,
            maxInterval: 1 * 60 * 1000,
            axisLabel: {
              show: false
            },
            axisTick: {
              inside: false,
              length: this.xTickLength / 2,
              lineStyle: {
                color: '#fff',
                width: 1,
                type: 'solid'
              }
            },
            axisLine: {
              lineStyle: {
                color: 'transparent'
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [{
          inverse: true,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: (value, index) => {
              var name
              var obj = _.find(this.data, ['name', value])
              if (value.length > 8) {
                name = `${value.substr(0, 4)}\n${value.substr(4, 3)}...`
              } else if (value.length > 4) {
                name = `${value.substr(0, 4)}\n${value.substr(4, 4)}`
              } else {
                name = value
              }
              return name
            },
            color: '#fff',
            inside: false,
            fontSize: 16,
            align: 'left',
            margin: 70
          },
          splitLine: {
            show: false
          },
          data: this.yList,
          splitNumber: this.yList.length
        }, {
          type: 'category',
          position: 'left',
          nameLocation: 'start',
          inverse: true,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(60, 166, 200, 0.1)', 'transparent']
            }
          },
          data: this.yList,
          splitNumber: this.yList.length
        }],
        dataZoom: [_.assign(
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            filterMode: 'none',
            show: true,
            zoomLock: true,
            zoomOnMouseWheel: false
          }, dataZoomX
        ), _.assign(
          {
            type: 'slider',
            yAxisIndex: [0, 1],
            filterMode: 'filter',
            show: true,
            zoomLock: true,
            width: 8,
            top: 50,
            bottom: 10,
            fillerColor: '#4F869E',
            handleStyle: {
              color: 'rgb(2, 5, 8)'
            },
            borderColor: 'rgb(2, 5, 8)',
            backgroundColor: 'rgb(2, 5, 8)',
            handleSize: 0
          }, dataZoomY
        ), _.assign(
          {
            type: 'inside',
            yAxisIndex: [0, 1],
            zoomOnMouseWheel: false,
            moveOnMouseMove: false,
            moveOnMouseWheel: true
          }, dataZoomY
        )],
        grid: {
          show: false,
          width: 'auto',
          height: this.ganttEl.clientHeight - 50 > this.yList.length * 50 - 10 ? this.yList.length * 50 - 10 : Math.floor((this.ganttEl.clientHeight - 50) / 50) * 50,
          top: 50,
          bottom: 0,
          left: 90,
          right: 15
        },
        series: [{
          type: 'custom',
          renderItem: this.renderItem,
          itemStyle: {
            normal: {
              opacity: 1
            }
          },
          emphasis: {
            itemStyle: {
              color: '#7a939e',
              borderColor: '#7a939e',
              borderWidth: 9
            }
          },
          encode: {
            x: [1, 2],
            y: 0
          },
          data: this.dataList,
          animation: false
        },
        {
          type: 'line',
          data: [],
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: false
            },
            data: [{
              xAxis: this.newTime.getTime()
            }],
            lineStyle: {
              color: '#7a939e',
              type: 'solid',
              width: 1
            },
            animation: false
          }
        }],
        animation: false
      }
      this.flightGantt.setOption(option, true)
      this.resetDoingDiv()
      // this.canvasCtx = this.ganttEl.querySelector('canvas').getContext('2d')
      // this.canvasCtx.save()
      // window.requestAnimationFrame(this.drawDRect)
      this.flightGantt.on('datazoom', (params) => {
        // window.requestAnimationFrame(this.drawDRect)
        if (this.dRectStatus) {
          this.resetDoingDiv()
          this.dRectStatus = false
        }
        if (params.hasOwnProperty('batch')) {
          params.batch.forEach(item => {
            if (item.hasOwnProperty('dataZoomIndex')) {
              this.dataZoomData[1] = item
            } else {
              var index = parseInt(item.dataZoomId[8])
              this.dataZoomData[(index == 2 ? 1 : 0)] = item
            }
          })
        } else {
          this.dataZoomData[1] = params
        }
      })
    },
    renderItem (params, api) {
      var categoryIndex = api.value(0)
      var style = api.style()
      var start = api.coord([api.value(1), categoryIndex])
      var end = api.coord([api.value(2), categoryIndex])
      var startTime = new Date(api.value(1))
      var endTime = new Date(api.value(2))
      var rectShape = this.cat.graphic.clipRectByRect({
        x: start[0],
        y: start[1] - this.xTickLength - this.divTop + (['E', 'R'].includes(api.value(4)) ? 20 : 12),
        width: end[0] - start[0],
        height: this.divHeight
      }, {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
      })
      var temp = this.setTextStyle(api, params, style)
      var reject = this.setRejectStyle(api, params)
      var obj = {
        type: 'group',
        diffChildrenByName: true,
        children: _.concat(
          [{
            type: 'rect',
            name: api.value(3) + 'rect',
            shape: rectShape ? {
              x: rectShape.x,
              y: rectShape.y,
              width: rectShape.width,
              height: rectShape.height,
              r: 4
            } : rectShape,
            style: style,
            z2: ['E', 'R'].includes(api.value(4)) ? 2 : 4
          }],
          temp,
          reject
        )
      }
      if (rectShape && (api.value(4) == 'D')) {
        this.$set(rectShape, 'dynamicTaskId', api.value(3))
        this.$set(rectShape, 'status', api.value(4))
        this.dRectList.push(rectShape)
      }
      this.dRectStatus = true
      /* if (api.value(4) == 'D') {
        var dom = document.getElementById(api.value(3) + api.value(4))
        if (rectShape) {
          // this.dRectList.push(rectShape)
          if (dom) {
            dom.parentNode.style.width = rectShape.width + 'px'
            dom.style.left = rectShape.x + 'px'
            dom.style.top = rectShape.y + 'px'
            dom.style.width = rectShape.width + 'px'
          } else {
            var div = document.createElement('div')
            div.style.width = rectShape.width
            var innerHtml = `
              <div id="${api.value(3) + api.value(4)}" class="task-doing-div" style="position: absolute; left: ${rectShape.x}px; top: ${rectShape.y}px; width: ${rectShape.width}px; height: 24px;">
                <div class="task-doing-animation"></div>
              </div>
            `
            div.innerHTML = innerHtml
            this.ganttEl.insertBefore(div, this.ganttEl.firstElementChild)
          }
        } else {
          dom.parentNode.parentNode.removeChild(dom.parentNode)
        }
      } */
      return rectShape && obj
    },
    resetDoingDiv () {
      var length = this.ganttEl.children.length - 1
      for (let i = 0; i < length; i++) {
        this.ganttEl.removeChild(this.ganttEl.children[0])
      }
      this.dRectList.forEach(item => {
        var div = document.createElement('div')
        div.style.width = item.width + 'px'
        div.style.height = item.height + 'px'
        div.style.position = 'absolute'
        div.style.left = item.x + 20 + 'px'
        div.style.top = item.y + 370 + 'px'
        div.style.overflow = 'hidden'
        div.style.borderRadius = '4px'
        div.style.pointerEvents = 'none'
        div.style.zIndex = 99
        var innerHtml = `
          <div id="${item.dynamicTaskId + item.status}" class="task-doing-div" style="position: absolute; width: ${item.width}px; height: ${item.height}px; z-index: 98;">
            <div class="task-doing-animation gantt-animation"></div>
          </div>
        `
        div.innerHTML = innerHtml
        this.ganttEl.insertBefore(div, this.ganttEl.firstElementChild)
      })
      this.dRectList = []
    },
    // 格式化 HH:MM
    formatterMin (row, column) {
      if (row[column.property]) {
        var date = new Date(row[column.property])
        var hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        var minite = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        return `${hour}:${minite}`
      } else {
        return ``
      }
    },
    formatterMinScope (value) {
      if (value) {
        var date = new Date(value)
        var hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        var minite = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        return `${hour}:${minite}`
      } else {
        return `—:—`
      }
    }/* ,
    drawDRect () {
      this.canvasCtx.restore()
      if (this.dRectList && !_.isEmpty(this.dRectList)) {
        this.dRectTempList = this.dRectList
        this.dRectList = []
      }
      this.dRectTempList.forEach(item => {
        this.canvasCtx.beginPath()
        var width = item.width / 2
        var grad = null
        if (!item.hasOwnProperty('i')) {
          this.$set(item, 'i', 0)
          this.canvasCtx.fillRect(item.x, item.y, item.i, item.height)
          grad = this.canvasCtx.createLinearGradient(item.x, item.y, item.x + item.i, item.y)
          console.log(`1rect => x : ${item.x}; y: ${item.y}; wt: ${item.i}; ht: ${item.height}`)
          console.log(`1grad => x : ${item.x}; y: ${item.y}; x1: ${item.x + item.i};`)
        } else {
          var canvas = this.ganttEl.querySelector('canvas')
          if ((item.x + item.i) < canvas.width) {
            if (item.i <= width) {
              this.canvasCtx.fillRect(item.x, item.y, item.i, item.height)
              grad = this.canvasCtx.createLinearGradient(item.x, item.y, item.x + item.i, item.y)
              console.log(`2rect => x : ${item.x}; y: ${item.y}; wt: ${item.i}; ht: ${item.height}`)
              console.log(`2grad => x : ${item.x}; y: ${item.y}; x1: ${item.x + item.i};`)
            } else if (width < item.i <= item.width) {
              this.canvasCtx.fillRect(item.x + item.i - width, item.y, width, item.height)
              grad = this.canvasCtx.createLinearGradient(item.x + item.i - width, item.y, item.x + item.i, item.y)
              console.log(`3rect => x : ${item.x + item.i - width}; y: ${item.y}; wt: ${width}; ht: ${item.height}`)
              console.log(`3grad => x : ${item.x + item.i - width}; y: ${item.y}; x1: ${item.x + item.i};`)
            } else if (item.width < item.i <= (item.width + width)) {
              this.canvasCtx.fillRect(item.x + item.i - width, item.y, width - (item.x + item.i - item.width), item.height)
              grad = this.canvasCtx.createLinearGradient(item.x + item.i - width, item.y, item.x + item.width, item.y)
              console.log(`4rect => x : ${item.x + item.i - width}; y: ${item.y}; wt: ${width - (item.x + item.i - item.width)}; ht: ${item.height}`)
              console.log(`4grad => x : ${item.x + item.i - width}; y: ${item.y}; x1: ${item.x + item.width};`)
            } else {
              item.i = 0
              this.canvasCtx.fillRect(item.x, item.y, item.i, item.height)
              grad = this.canvasCtx.createLinearGradient(item.x, item.y, item.x + item.i, item.y)
              console.log(`5rect => x : ${item.x}; y: ${item.y}; wt: ${item.i}; ht: ${item.height}`)
              console.log(`5grad => x : ${item.x}; y: ${item.y}; x1: ${item.x + item.i};`)
            }
          } else if (canvas.width < (item.x + item.i) < (canvas.width + width)) {
            this.canvasCtx.fillRect(item.x + item.i - width, item.y, width - (item.x + item.i - canvas.width), item.height)
            grad = this.canvasCtx.createLinearGradient(item.x + item.i - width, item.y, canvas.width, item.y)
            console.log(`6rect => x : ${item.x + item.i - width}; y: ${item.y}; wt: ${width - (item.x + item.i - canvas.width)}; ht: ${item.height}`)
            console.log(`6grad => x : ${item.x + item.i - width}; y: ${item.y}; x1: ${canvas.width};`)
          } else if ((canvas.width + width) < (item.x + item.i)) {
            item.i = 0
            this.canvasCtx.fillRect(item.x, item.y, item.i, item.height)
            grad = this.canvasCtx.createLinearGradient(item.x, item.y, item.x + item.i, item.y)
            console.log(`7rect => x : ${item.x}; y: ${item.y}; wt: ${item.i}; ht: ${item.height}`)
            console.log(`7grad => x : ${item.x}; y: ${item.y}; x1: ${item.x + item.i};`)
          }
        }
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.7)')
        this.canvasCtx.fillStyle = grad
        item.i += 10
        window.requestAnimationFrame(this.drawDRect)
      })
    } */
  }
}
</script>

<style>
.flight-gantt-top-main {
  margin: 10px 20px 20px 20px;
}
.flight-gantt-top-container {
  width: 100%;
  height: 200px;
  display: flex;
}
.flight-gantt-top-container .container-left {
  flex-grow: 1;
  margin-right: 20px;
  padding: 20px 20px 10px 20px;
}
.flight-gantt-top-container .container-right {
  width: 440px;
  flex-grow: 0;
}
.flight-gantt-top-container .container-left .top-title {
  color: #7a939e;
  font-size: 14px;
  line-height: 14px;
  margin-bottom: 12px;
}
.flight-gantt-top-container .container-left .top-cont {
  color: #fff;
  font-size: 16px;
  line-height: 16px;
  margin-bottom: 20px;
}
.flight-gantt-top-container .container-left .bottom-table .el-row {
  font-size: 16px;
  margin-left: -20px !important;
  margin-right: -20px !important;
  padding: 0 20px;
}
.flight-gantt-top-container .container-left .bottom-table-title {
  color: #60aac6;
  line-height: 30px;
  height: 30px;
  background-color: rgba(60, 166, 200, 0.2);
}
.flight-gantt-top-container .container-left .bottom-table-cont {
  color: #fff;
  line-height: 40px;
  height: 40px;
}
.flight-gantt-top-container .container-left .bottom-table .el-col {
  padding: 0 !important;
}
.flight-gantt-bottom-container {
  margin-top: 20px;
  height: calc(100% - 220px);
}
.flight-gantt-bottom-container .table-header {
  display: flex;
  align-items: center;
}
.flight-gantt-bottom-container .table-header .table-header-title {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.flight-gantt-bottom-container .table-header .table-header-button {
  display: flex;
  align-items: center;
  margin-right: 20px;
  width: 250px;
  height: 60px;
  flex-grow: 0;
}
.flight-gantt-bottom-container .table-header .table-header-button .ctrl-f-query {
  width: 32px;
  height: 32px;
}
.flight-gantt-bottom-container .table-header .table-header-button .el-radio-group {
  margin: 0 0 0 20px !important;
  width: calc(100% - 52px) !important;
}
/* gantt配置 */
.flight-gantt {
  width: calc(100%);
  height: calc(100%);
}
</style>
