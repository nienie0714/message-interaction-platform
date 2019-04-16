<template>
  <div class="res-gantt-view gantt-view">
    <el-container direction="vertical">
      <div class="header-menu" ref="homeHeader">
        <el-header style="height: 80px; font-size: 12px">
          <div class="gantt-header">
            <div class="header-title">
              <div class="gantt-logo"></div>
              <span class="gantt-title">{{deptName}}</span>
            </div>
            <div class="header-update-div">
              <div>最后更新时间：</div>
              <div>{{lastUpdateTime}}</div>
              <div class="header-refrush">
                <div class="img-refrush" @click="queryData"></div>
              </div>
            </div>
          </div>
        </el-header>
      </div>
      <el-main class="home-top-main">
        <el-container class="table-container gantt-container res-gantt-container">
          <el-header>
            <div class="table-header">
              <div class="table-header-title">
                <img :src="require('@img/title_deco.png')"/>
                <span class="header-title">资源甘特图</span>
                <span>
                  <div class="dot-font">
                    <div class="dot-color-4_1"></div>
                    <span>已完成</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-5_2"></div>
                    <span>正在执行(动态)</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-5_1"></div>
                    <span>计划执行</span>
                  </div>
                  <div class="dot-font">
                    <div class="dot-color-3"></div>
                    <span>时间冲突</span>
                  </div>
                </span>
              </div>
              <div class="table-header-button">
                <div class="ctrl-f-query" @click="resetMarkLine"></div>
                <el-select v-model="queryTask.taskNo" :filterable="true" placeholder="请选择任务" :default-first-option="true" @change="changeQuery"
                style="width: 90%; margin: 0 5% 10px 5%;">
                  <el-option v-for="task in taskArr" :key="task.index" :label="task.label" :value="task.key"></el-option>
                </el-select>
              </div>
            </div>
          </el-header>
          <el-main>
            <div :style="resGanttStyle">
              <div id="resourceGantt" class="resource-gantt" :style="resGanttStyle"></div>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import baseMixin from '../../../components/mixin/baseMixin'
import webSocketMixin from '../../../components/mixin/webSocketMixin'
import _ from 'lodash'
import { postData } from '../../../api/base'

export default {
  name: 'hello',
  mixins: [baseMixin, webSocketMixin],
  data () {
    return {
      timeInt: 15 * 1000,
      deptName: '',
      lastUpdateTime: '',
      resGanttStyle: {
        width: 'calc(100%)',
        height: 'calc(100%)'
        // height: Math.floor((window.innerHeight - 165) / 50) * 50 - 10 + 'px'
      },
      queryUrl: 'taskscheduling/vue/gantt/resouces',
      queryTask: {},
      sort: '',
      taskArr: [],
      data: [],
      dataList: [],
      ganttEl: null,
      dRectList: [],
      dRectStatus: false,
      yList: [],
      dataZoomData: [null, null],
      resourceGantt: null,
      cat: null,
      xTickLength: 20,
      divTop: -3,
      divHeight: 36,
      color: {
        Unexecuted: '#7eb3d6',
        Finished: '#03a786',
        Executing: '#03a786',
        Overlop: '#e65069'
      }
    }
  },
  mounted () {
    // this.resGanttStyle.height = Math.floor((window.innerHeight - 175) / 50) * 50 + 'px'
    this.deptName = localStorage.getItem('deptName')
    this.taskArr = this.$store.getters.getTaskColOption
    this.$set(this.queryTask, 'taskNo', localStorage.getItem('resGanttTaskNo'))
    this.cat = this.$echarts
    this.ganttEl = document.getElementById('resourceGantt')
    this.resourceGantt = this.$echarts.init(this.ganttEl)
    var timer = setInterval(this.updateOption, this.timeInt)
    this.queryData()
    this.$nextTick(() => {
      window.onresize = () => {
        var width = this.resourceGantt.getOption()
        var opts = {
          width: 'auto',
          height: (this.ganttEl.clientHeight - 50) > (this.yList.length * 50 - 10) ? (this.yList.length * 50 - 10) : (this.ganttEl.clientHeight)
        }
        this.resourceGantt.resize(opts)
        this.updateOption()
      }
    })
  },
  methods: {
    // 自定义websocket获取数据后操作
    customWsOnMessage (data) {
      if ((data.type == 3) && (data.Authorization == localStorage.getItem('token'))) {
        if (data.hasOwnProperty('data')) {
          this.$set(this.queryTask, 'taskNo', data.data.taskNo)
          this.$set(this.queryTask, 'name', data.data.name)
          this.queryData()
        }
        if (data.hasOwnProperty('sort')) {
          this.sort = data.sort
        }
      }
    },
    changeQuery () {
      this.$set(this.queryTask, 'name', null)
      this.queryData()
    },
    queryData () {
      postData(this.queryUrl, this.queryTask).then(res => {
        if (res.data.code == 0) {
          var hour = this.newTime.getHours() < 10 ? `0${this.newTime.getHours()}` : this.newTime.getHours()
          var minite = this.newTime.getMinutes() < 10 ? `0${this.newTime.getMinutes()}` : this.newTime.getMinutes()
          var second = this.newTime.getSeconds() < 10 ? `0${this.newTime.getSeconds()}` : this.newTime.getSeconds()
          this.lastUpdateTime = `${hour}:${minite}:${second}`
          this.sort = null
          this.data = res.data.data
          this.updateOption()
        }
      })
    },
    cutText (x, y, params, flag) {
      var obj = this.cat.graphic.clipPointsByRect([[x, y]], {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
      })
      if (flag && (obj[0][0] == params.coordSys.x)) {
        return []
      } else {
        return obj
      }
    },
    getValueAgo (value, index) {
      if (!value) {
        if (this.dataList[index - 1] && (this.dataList[index - 1].value[0] == this.dataList[index].value[0])) {
          return this.dataList[index - 1]
        } else {
          return null
        }
      } else {
        return this.getValueAgo(this.dataList[index - 1].value[4], index - 1)
      }
    },
    getValueNext (value, index) {
      if (value) {
        if (this.dataList[index + 1] && (this.dataList[index + 1].value[0] == this.dataList[index].value[0])) {
          return this.getValueNext(this.dataList[index + 1].value[4], index + 1)
        } else {
          return null
        }
      } else {
        return this.dataList[index]
      }
    },
    hiddenTime (params, api) {
      var flag1 = 0
      var flag2 = 0
      var valueAgo = this.dataList[params.dataIndex - 1]
      if (!api.value(4)) {
        if (valueAgo && (api.value(0) != valueAgo.value[0])) {
          valueAgo = null
        }
      } else {
        valueAgo = this.getValueAgo(api.value(4), params.dataIndex)
      }
      if (!valueAgo || ((api.value(1) - valueAgo.value[2]) >= 750000)) {
        flag1 = 0
      } else {
        flag1 = 1
      }
      if (this.dataList[params.dataIndex + 1] && (this.dataList[params.dataIndex + 1].value[0] == this.dataList[params.dataIndex].value[0])) {
        var valueNext = this.getValueNext(api.value(2), params.dataIndex)
        if (valueNext && !valueNext.value[4]) {
          if ((valueNext.value[1] - api.value(2)) >= 750000) {
            flag2 = 0
          } else {
            flag2 = 2
          }
        }
      }
      return flag1 + flag2
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
    // (开始时间, 结束时间, 编号, 开始横坐标, 结束横坐标, 纵坐标, 颜色, params, 隐藏标志)
    setTextStyle (info1, info2, name, x1, x2, y, color, params, flag, status) {
      if (x1 >= params.coordSys.x) {
        var obj1 = {
          type: 'text',
          name: name + 'start',
          info: info1,
          style: {
            text: this.formatterTimeOfHM(info1),
            x: x1,
            y: y + 2,
            font: `normal normal 14px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
            fill: status == 1 ? this.color.Overlop : color,
            stroke: status == 1 ? this.color.Overlop : color
          },
          z2: 1
        }
      }
      if (x2 >= params.coordSys.x) {
        var obj2 = {
          type: 'text',
          name: name + 'end',
          info: info2,
          style: {
            text: this.formatterTimeOfHM(info2),
            x: x2,
            y: y + 2,
            font: `normal normal 14px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
            fill: status == 2 ? this.color.Overlop : (status == 3 ? this.color.Unexecuted : color),
            stroke: status == 2 ? this.color.Overlop : (status == 3 ? this.color.Unexecuted : color)
          },
          z2: 1
        }
      }
      var returnArr = []
      switch (flag) {
        case 0: returnArr = this.compact([obj1, obj2])
        break
        case 1: returnArr = this.compact([obj2])
        break
        case 2: returnArr = this.compact([obj1])
        break
        case 3: returnArr = []
        break
      }
      return returnArr
    },
    getTextLength (width) {
      return Math.floor((width - 20) / 12)
    },
    resetMarkLine () {
      if (this.dataZoomData[0]) {
        this.$delete(this.dataZoomData[0], 'start')
        this.$delete(this.dataZoomData[0], 'end')
        this.dataZoomData[0].startValue = this.newTime.getTime() - ((this.ganttEl.clientWidth - 105) / 20) * (60 * 1000)
        this.dataZoomData[0].endValue = this.newTime.getTime() + ((this.ganttEl.clientWidth - 105) / 20) * (60 * 1000)
        this.resourceGantt.dispatchAction({
          type: 'dataZoom',
          batch: [this.dataZoomData[0]]
        })
      }
    },
    updateOption () {
      var yList = []
      var dataList = []
      this.dRectList = []
      var timeStep = this.newTime.getTime()
      this.data.forEach((item, index) => {
        yList.push(item.name)
        var startTimeAgo = null
        var endTimeAgo = null
        _.forEach(item.tasks, (obj, objIndex) => {
          var color = this.color[obj.status]
          var value = []
          var flightNo = []
          if (obj.flightNoA) {
            flightNo.push(obj.flightNoA)
          }
          if (obj.flightNoD) {
            flightNo.push(obj.flightNoD)
          }
          if (endTimeAgo && (obj.beginTime < endTimeAgo)) {
            value = [index, obj.beginTime, obj.endTime ? obj.endTime : timeStep, startTimeAgo, endTimeAgo, flightNo.join('/'), obj.dynamicTaskId, obj.status]
          } else {
            value = [index, obj.beginTime, obj.endTime ? obj.endTime : timeStep, null, null, flightNo.join('/'), obj.dynamicTaskId, obj.status]
          }
          dataList.push({
            name: item.name,
            value: value,
            status: obj.status,
            itemStyle: {
              color: color
            }
          })
          startTimeAgo = obj.beginTime
          endTimeAgo = obj.endTime ? obj.endTime : timeStep
        })
      })
      this.yList = yList
      this.dataList = dataList
      var dataZoomX = {
        type: 'inside',
        xAxisIndex: [0, 1],
        filterMode: 'none',
        show: true,
        zoomLock: true,
        zoomOnMouseWheel: false
      }
      var dataZoomY = {}
      if (this.dataZoomData[0]) {
        if (this.dataZoomData[0].hasOwnProperty('start')) {
          this.$set(dataZoomX, 'start', this.dataZoomData[0].start)
          this.$set(dataZoomX, 'end', this.dataZoomData[0].end)
        } else {
          this.$set(dataZoomX, 'startValue', this.dataZoomData[0].startValue)
          this.$set(dataZoomX, 'endValue', this.dataZoomData[0].endValue)
        }
      } else {
        this.$set(dataZoomX, 'startValue', this.newTime.getTime() - ((this.ganttEl.clientWidth - 105) / 20) * (60 * 1000))
        this.$set(dataZoomX, 'endValue', this.newTime.getTime() + ((this.ganttEl.clientWidth - 105) / 20) * (60 * 1000))
      }
      if (this.dataZoomData[1]) {
        if (this.dataZoomData[1].hasOwnProperty('start')) {
          this.$set(dataZoomY, 'start', this.dataZoomData[1].start)
          this.$set(dataZoomY, 'end', this.dataZoomData[1].end)
        } else {
          this.$set(dataZoomY, 'startValue', this.dataZoomData[1].startValue)
          this.$set(dataZoomY, 'endValue', this.dataZoomData[1].endValue)
        }
      } else {
        this.$set(dataZoomY, 'startValue', this.yList[0])
        this.$set(dataZoomY, 'endValue', this.yList[Math.floor((this.ganttEl.clientHeight - 40) / 50) - 1])
      }
      var option = {
        tooltip: {
          enterable: true,
          formatter: (params) => {
            var html = `
            <div class="tooltip">
              <div>${params.data.value[5]}</div>
              <div>
                <div class="font-color-gray">执行人：</div>
                <div>${params.data.name}</div>
              </div>
              <div>
                <div style="width: 50%;">
                  <div class="font-color-gray">起始时间：</div>
                  <div class="${['Executing', 'Finished'].includes(params.data.value[7]) ? 'text-dec' : ''}">${this.formatterTimeOfHM(params.data.value[1])}</div>
                </div>
                <div style="width: 50%;">
                  <div class="font-color-gray">结束时间：</div>
                  <div class="${['Finished'].includes(params.data.value[7]) ? 'text-dec' : ''}">${this.formatterTimeOfHM(params.data.value[2])}</div>
                </div>
              </div>
            </div>
            `
            return html
          },
          backgroundColor: 'rgba(8, 25, 38, 0.93)',
          extraCssText: 'border-radius: 8px; border: 1px solid rgba(60, 166, 200, 0.7); box-shadow: 0 0 30px rgba(60, 166, 200, 0.4) inset, 0 8px 20px rgba(6, 13, 20, 0.9);'
        },
        xAxis: [
          {
            name: '执行者',
            nameLocation: 'start',
            nameGap: 30,
            nameTextStyle: {
              color: '#7a939e',
              fontSize: 14,
              verticalAlign: 'middle',
              align: 'center'
            },
            type: 'time',
            position: 'top',
            offset: 5,
            scale: true,
            min: this.newTime.getTime() - 12 * 3600 * 1000,
            max: this.newTime.getTime() + 12 * 3600 * 1000,
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
            offset: this.xTickLength / 2 + 5,
            scale: true,
            min: this.newTime.getTime() - 12 * 3600 * 1000,
            max: this.newTime.getTime() + 12 * 3600 * 1000,
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
            color: (value, index) => {
              var obj = _.find(this.data, ['name', value])
              if (obj && obj.hasExecutingTask) {
                return '#fff'
              } else {
                return '#fdcf53'
              }
            },
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
        dataZoom: [dataZoomX, _.assign({
          type: 'slider',
          yAxisIndex: [0, 1],
          filterMode: 'filter',
          show: true,
          zoomLock: true,
          zoomOnMouseWheel: false,
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
        ), _.assign({
          type: 'inside',
          yAxisIndex: [0, 1],
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true
        }, dataZoomY
        )],
        grid: {
          show: false,
          width: 'auto',
          height: (this.ganttEl.clientHeight - 50) > (this.yList.length * 50 - 10) ? (this.yList.length * 50 - 10) : (this.ganttEl.clientHeight - 50),
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
      this.resourceGantt.setOption(option, true)
      this.resetDoingDiv()
      this.resourceGantt.on('datazoom', (params) => {
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
      var valueNext = this.dataList[params.dataIndex + 1]
      var start = api.coord([api.value(1), categoryIndex])
      var end = api.coord([api.value(2), categoryIndex])
      var startTime = new Date(api.value(1))
      var endTime = new Date(api.value(2))
      var style = api.style()
      var obj = {}
      var temp = []
      var count = 0
      var endY = 0
      var overlopShape = null
      var overlopStart = null
      var overlopEnd = null
      var text = ''
      var length = 0
      var textObj = {}
      var textColor = this.color[api.value(7)]

      var flag = this.hiddenTime(params, api)

      var rectShape = this.cat.graphic.clipRectByRect({
        x: start[0],
        y: start[1] - this.xTickLength - this.divTop,
        width: end[0] - start[0],
        height: this.divHeight
      }, {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height
      })
      if (rectShape && (api.value(7) == 'Executing')) {
        this.$set(rectShape, 'dynamicTaskId', api.value(6))
        this.$set(rectShape, 'status', api.value(7))
        this.dRectList.push(rectShape)
      }
      this.dRectStatus = true
      // 当前任务与下一个任务重叠
      if (rectShape && valueNext && valueNext.value[4] && (valueNext.value[1] < valueNext.value[4])) {
        overlopStart = api.coord([valueNext.value[1], categoryIndex])
        overlopEnd = api.coord([valueNext.value[2], categoryIndex])
        endY = (end[0] > overlopEnd[0]) ? end[0] : overlopEnd[0]
        // 重叠部分图形
        overlopShape = this.cat.graphic.clipRectByRect({
          x: overlopStart[0],
          y: overlopStart[1] - this.xTickLength - this.divTop,
          width: ((end[0] < overlopEnd[0]) ? end[0] : overlopEnd[0]) - overlopStart[0],
          height: this.divHeight
        }, rectShape)
        //                      (开始时间,      结束时间,     编号,          开始横坐标,     结束横坐标, 纵坐标,                                    颜色,      params, 隐藏标志)
        temp = this.setTextStyle(api.value(1), api.value(2), api.value(6), start[0] - 50, endY + 10, start[1] - this.xTickLength - this.divTop, textColor, params, flag, 2)
        count = (end[0] > overlopEnd[0]) ? 3 : 1
      // 上一个任务与当前任务重叠
      } else if (rectShape && api.value(4) && (api.value(1) < api.value(4))) {
        overlopStart = api.coord([api.value(3), categoryIndex])
        overlopEnd = api.coord([api.value(4), categoryIndex])
        endY = (end[0] > overlopEnd[0]) ? end[0] : overlopEnd[0]
        // 重叠部分图形
        overlopShape = this.cat.graphic.clipRectByRect({
          x: start[0],
          y: start[1] - this.xTickLength - this.divTop,
          width: ((end[0] < overlopEnd[0]) ? end[0] : overlopEnd[0]) - start[0],
          height: this.divHeight
        }, rectShape)
        //                      (开始时间,      结束时间,     编号,          开始横坐标,            结束横坐标, 纵坐标,                                         颜色,      params, 隐藏标志)
        temp = this.setTextStyle(api.value(1), api.value(2), api.value(6), overlopStart[0] - 50, endY + 10, start[1] - this.xTickLength - this.divTop + 20, textColor, params, flag, 1)
        count = (end[0] > overlopEnd[0]) ? 2 : 4
      } else if (rectShape) {
        if (this.dataList[params.dataIndex + 1] && (this.dataList[params.dataIndex + 1].value[3] != null)) {
          temp = []
        } else {
          temp = this.setTextStyle(api.value(1), api.value(2), api.value(6), start[0] - 50, end[0] + 10, start[1] - this.xTickLength - this.divTop + 10, textColor, params, flag, api.value(7) == 'Executing' ? 3 : 0)
        }
        text = api.value(5)
        if (rectShape) {
          length = this.getTextLength(rectShape.width)
          if ((length - 1) <= 0) {
            text = ''
          } else if (length < text.length) {
            text = text.substr(0, length - 1) + '...'
          }
        } else {
          text = ''
        }
        if (text) {
          textObj = {
            type: 'text',
            name: api.value(6) + 'flight',
            info: api.value(5),
            style: {
              text: text,
              x: this.cutText(start[0] + 10, start[1] - this.xTickLength - this.divTop + 10, params)[0][0],
              y: this.cutText(start[0] + 10, start[1] - this.xTickLength - this.divTop + 10, params)[0][1],
              font: `normal bold 16px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
              fill: '#fff',
              stroke: '#fff'
            },
            z2: 3
          }
        }
        obj = {
          type: 'group',
          diffChildrenByName: true,
          children: this.compact(_.concat(
            [{
              type: 'rect',
              name: api.value(6) + 'rect',
              shape: rectShape ? {
                x: rectShape.x,
                y: rectShape.y,
                width: rectShape.width,
                height: rectShape.height,
                r: 6
              } : rectShape,
              style: style,
              z2: 2
            }],
            textObj,
            _.compact(temp)
          ))
        }
        count = 0
        return rectShape && obj
      }
      if (count && rectShape) {
        if (overlopShape && (overlopShape.width < 1)) {
          overlopShape.width = 1
        }
        if ((count == 1) && overlopShape) {
          text = api.value(5)
          length = this.getTextLength(rectShape.width - overlopShape.width)
        } else {
          text = `${api.value(5)}（时间冲突）`
          length = this.getTextLength(rectShape.width)
        }
        if ((length - 1) <= 0) {
          text = ''
        } else if (length < text.length) {
          text = text.substr(0, length - 1) + '...'
        }
        /* if (length < text.length) {
          text = text.substr(0, length - 1) + '...'
        } */
        if (text) {
          textObj = {
            type: 'text',
            info: api.value(5),
            name: api.value(6) + 'flight',
            style: {
              text: text,
              x: this.cutText(start[0] + 10, start[1] - this.xTickLength - this.divTop + 10, params)[0][0],
              y: this.cutText(start[0] + 10, start[1] - this.xTickLength - this.divTop + 10, params)[0][1],
              font: `normal bold 16px 'Microsoft YaHei', 微软雅黑, Arial, sans-serif`,
              fill: '#fff',
              stroke: '#fff'
            },
            z2: [1, 3].includes(count) ? 3 : 6
          }
        }
        obj = {
          type: 'group',
          diffChildrenByName: true,
          children: this.compact(_.concat(
            [{
              type: 'rect',
              name: api.value(6) + 'rect',
              shape: rectShape ? {
                x: rectShape.x,
                y: rectShape.y,
                width: rectShape.width,
                height: rectShape.height,
                r: count == 1 ? [6, 0, 0, 6] : (count == 3 ? 6 : (count == 2 ? [0, 6, 6, 0] : 0))
              } : rectShape,
              style: style,
              z2: [1, 3].includes(count) ? 1 : 4
            }], {
              type: 'rect',
              name: api.value(6) + 'overlop',
              shape: overlopShape,
              style: api.style({
                fill: this.color.Overlop
              }),
              z2: [1, 3].includes(count) ? 2 : 5
            },
            textObj,
            _.compact(temp)
          ))
        }
        return rectShape && obj
      }
    },
    resetDoingDiv () {
      var length = this.ganttEl.children.length - 2
      for (let i = 0; i < length; i++) {
        this.ganttEl.removeChild(this.ganttEl.children[0])
      }
      this.dRectList.forEach(item => {
        var div = document.createElement('div')
        div.style.width = item.width + 'px'
        div.style.height = item.height + 'px'
        div.style.position = 'absolute'
        div.style.left = item.x + 'px'
        div.style.top = item.y + 'px'
        div.style.overflow = 'hidden'
        div.style.borderRadius = '6px'
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
    }
  },
  watch: {
    sort (val, oldVal) {
      if (val) {
        this.data = _.orderBy(this.rightDrag, ['taskCount'], val)
      }
    }
  }
}
</script>

<style>
.res-gantt-container {
  height: calc(100% - 20px);
  margin: 0 20px 20px 20px;
}
.res-gantt-container .el-header,
.res-gantt-container .el-main {
  padding: 0;
}
.res-gantt-container .table-header {
  display: flex;
  align-items: center;
}
.res-gantt-container .table-header .table-header-title {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.res-gantt-container .table-header .table-header-button {
  display: flex;
  align-items: center;
  margin-right: 20px;
  width: 250px;
  height: 60px;
  flex-grow: 0;
}
.res-gantt-container .table-header .table-header-button .ctrl-f-query {
  width: 32px;
  height: 32px;
}
.res-gantt-container .table-header .table-header-button .el-select {
  margin: 0 0 0 20px !important;
  width: calc(100% - 52px) !important;
}
/* gantt配置 */
.resource-gantt {
  width: calc(100%)
}
.tooltip {
  display: flex;
  flex-direction: column;
  margin: 0 7px;
}
.tooltip>div {
  display: flex;
  margin-bottom: 12px;
}
.tooltip>div:first-of-type {
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}
.tooltip>div:not(:first-of-type) {
  height: 14px;
  line-height: 14px;
  font-size: 14px;
}
.tooltip>div:last-of-type {
  display: flex;
  margin-bottom: 7px;
}
.tooltip>div>div {
  display: flex;
}
.tooltip>div:last-of-type>div {
  margin-right: 20px;
}
</style>
