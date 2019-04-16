<script>
import { postData, queryAll } from '../../api/base'

export default {
  data () {
    return {
      // 任务调度、航班查询特殊设置
      pageStyle: [{
        key: 'background',
        value: 'url(' + require('@img/task_bg.jpg') + ') top repeat-x'
      }, {
        key: 'background-color',
        value: '#060d14'
      }],
      // 两个列表整体container样式
      tableContStyle: {
        width: '100%'
      },
      // 任务调度、航班查询body容器宽度样式
      wholeBodyStyle: {
        width: window.innerWidth + 'px'
      },
      // 左侧table宽度
      divLeftTableStyle: {
        width: '602px',
        minWidth: '602px'
      },
      // 右侧table宽度
      divRightTableStyle: {
        width: 'calc(100% - 850px)'
      },
      // 右侧table的width样式
      rightTableWidthStyle: {
        width: '0px'
      },
      // table的body样式
      divTableBodyStyle: {
        height: '0px'
      },
      // 关注航班请求路径
      markFlightUrl: 'flight/dynamic/markDynamicFlight',
      // 取消关注航班请求路径
      cancelMarkFlightUrl: 'flight/dynamic/cancelMarkDynamicFlight',
      // 默认隐藏/显示列面板
      defaultRow: false,
      // 同一查找条件点击次数
      ctrlFTouchTime: 0,
      // 查找面板展开状态
      ctrlFVisible: false,
      // 查找功能条件
      ctrlF: [[{
        // 'p': '航线',
        key: 'findKey',
        value: '',
        type: 'input',
        inputText: '航班号',
        toUpper: true,
        icon: 'none'
      }]],
      ctrlFList: [],
      // 行class定义
      tableClickRowClass: {},
      // 点击任务行
      clickTaskDiv: false,
      oprPopoverDirect: '',
      oprPopoverIndex: null
    }
  },
  mounted () {
    var bodyView = this.$root.$el.querySelector('.body-view')
    this.pageStyle.forEach(item => {
      bodyView.style[item.key] = item.value
    })
    this.scrollTable()
  },
  methods: {
    handleCtrlFButton () {
      this.ctrlFVisible = !this.ctrlFVisible
      if (!this.ctrlFVisible) {
        this.ctrlF[0][0].value = ''
      }
    },
    wholeMounted (top) {
      this.divTableBodyStyle.height = window.innerHeight - top - 62 + 'px'
      this.tableContStyle.width = window.innerWidth - 40 + 'px'
      this.wholeBodyStyle.width = window.innerWidth - 20 + 'px'
      this.updateTableWidth()
    },
    // 窗口变化/初始化时根据窗口修改组件样式
    windowResizeStyle (that) {
      const wholeWidth = that.$el.querySelector('.el-container')
      wholeWidth.style.width = window.innerWidth - 20 + 'px'
    },
    // 发送查询请求
    queryDataReq () {
      /* this.tableData.loading = true */
      this.getQueryData()
      this.customQueryMethod()
      postData(this.queryUrl, this.queryData).then(response => {
        this.tableData.loading = false
        if (response.data.data.hasOwnProperty('rows')) {
          this.tableData.data = response.data.data.rows
        } else {
          this.tableData.data = response.data.data
        }
      })
    },
    updateTableWidth () {
      var key = this.customOtherFields()
      var otherFieldsWidth = 0
      this.tableData[key].forEach(item => {
        if (!item.hidden) {
          otherFieldsWidth = otherFieldsWidth + parseInt(item.width)
        }
      })
      this.rightTableWidthStyle.width = otherFieldsWidth + 'px'
      let leftWidth = 0
      this.tableData.fields.forEach(item => {
        if (!item.hidden) {
          leftWidth += parseInt(item.width)
        }
      })
      leftWidth += 2
      this.divLeftTableStyle.width = leftWidth + 'px'
      this.divLeftTableStyle.minWidth = leftWidth + 'px'
      this.divRightTableStyle.width = 'calc(100% - ' + this.divLeftTableStyle.width + ' - ' + this.divOprTableStyle.width + ')'
      this.customUpdateTableWidth(otherFieldsWidth)
    },
    clickRow (index, type) {
      if (this.clickTaskDiv) {
        this.tableClickRowClass = {}
        this.$set(this.tableClickRowClass, index, true)
        this.clickTaskDiv = false
      } else {
        if (type == 'scroll') {
          this.tableClickRowClass = {}
          this.$set(this.tableClickRowClass, index, true)
        } else {
          if (this.tableClickRowClass.hasOwnProperty(index) && this.tableClickRowClass[index]) {
            this.tableClickRowClass = {}
          } else {
            this.tableClickRowClass = {}
            this.$set(this.tableClickRowClass, index, true)
          }
        }
      }
    },
    scrollTable () {
      var oprTableBody = document.getElementsByClassName('div-opr-table_body')[0]
      var rightTableBody = document.getElementsByClassName('div-right-table_body')[0]
      oprTableBody.onscroll = function () {
        var oprTableTop = this.scrollTop
        document.getElementsByClassName('div-right-table_body')[0].scrollTop = oprTableTop
        document.getElementsByClassName('div-left-table_body')[0].scrollTop = oprTableTop
      }
      rightTableBody.onscroll = function () {
        var rightTableLeft = this.scrollLeft
        document.getElementsByClassName('div-right-table_header')[0].scrollLeft = rightTableLeft
      }
    },
    scrollEvent (event) {
      var scrollTop = event.wheelDeltaY
      document.getElementsByClassName('div-opr-table_body')[0].scrollTop -= scrollTop
    },
    // 取消隐藏/显示列 close关闭面板事件
    closeDefaultRow () {
      this.defaultRow = false
    },
    changeHandleOfCtrlF (data, selectedValue) {
      this.ctrlFTouchTime = 0
      this.ctrlFList = []
    },
    getCtrlFList () {
      var data = this.getQueryData(this.ctrlF[0])
      this.tableData.data.forEach((value, index, array) => {
        if (value['flightNoA'] && !value['flightNoD']) {
          if (value['flightNoA'].indexOf(data['findKey']) >= 0) {
            value.lineNum = index
            this.ctrlFList[this.ctrlFList.length] = value
          }
        } else if (value['flightNoA'] && value['flightNoD']) {
          if (value['flightNoA'].indexOf(data['findKey']) >= 0) {
            value.lineNum = index
            this.ctrlFList[this.ctrlFList.length] = value
          } else if (value['flightNoD'].indexOf(data['findKey']) >= 0) {
            value.lineNum = index
            this.ctrlFList[this.ctrlFList.length] = value
          }
        } else if (!value['flightNoA'] && value['flightNoD']) {
          if (value['flightNoD'].indexOf(data['findKey']) >= 0) {
            value.lineNum = index
            this.ctrlFList[this.ctrlFList.length] = value
          }
        }
      })
    },
    findCtrlF () {
      if (this.ctrlFTouchTime === 0) {
        this.getCtrlFList()
      } else {
        if (this.ctrlFTouchTime >= this.ctrlFList.length) {
          this.ctrlFTouchTime = 0
        }
      }
      if (this.ctrlFList.length > 0) {
        this.locateScroll()
        this.ctrlFTouchTime++
      }
    },
    locateScroll () {
      var scrollTop = this.$refs.wholeTable.querySelectorAll('tr')[this.ctrlFList[this.ctrlFTouchTime].lineNum].offsetTop
      document.getElementsByClassName('div-opr-table_body')[0].scrollTop = scrollTop
      this.clickRow(this.ctrlFList[this.ctrlFTouchTime].lineNum, 'scroll')
    },
    tableRowClassName (data) {
      switch (data.row.colourType) {
        case '1' : return 'color-1-row'
        case '2' : return 'color-2-row'
        case '3' : return 'color-3-row'
        case '4' : return 'color-4-row'
        case '4.1' : return 'color-4_1-row'
        case '4.2' : return 'color-4_2-row'
        case '4.3' : return 'color-4_3-row'
      }
    },
    // 关注航班事件
    markFlight (row, event) {
      var data = {
        dynamicFlightIdA: row.dynamicFlightIdA,
        dynamicFlightIdD: row.dynamicFlightIdD
      }
      postData(this.markFlightUrl, data).then(response => {
        if (response.data.code == 0) {
          this.showSuccess('关注')
          row.mark = true
        } else {
          this.showError('关注')
        }
      })
    },
    // 取消关注航班事件
    cancelMarkFlight (row, event) {
      var data = {
        dynamicFlightIdA: row.dynamicFlightIdA,
        dynamicFlightIdD: row.dynamicFlightIdD
      }
      postData(this.cancelMarkFlightUrl, data).then(response => {
        if (response.data.code == 0) {
          this.showSuccess('取消关注')
          row.mark = false
        } else {
          this.showError('取消关注')
        }
      })
    },
    saveDefaultRowReq (key) {
      var fields = []
      var otherfields = []
      for (let i = 8; i < this.tableData.fields.length; i++) {
        if (!this.tableData.fields[i].hidden) {
          fields.push(this.tableData.fields[i].prop)
        }
      }
      this.tableData[key].forEach(item => {
        if (!item.hidden) {
          otherfields.push(item.prop)
        }
      })
      var data = {
        'flightFields': fields
      }
      this.$set(data, key, otherfields)
      queryAll(this.saveDefaultRowUrl, data).then(response => {
        if (response.data.code == 0) {
          this.defaultRow = false
          this.showSuccess('保存')
        } else {
          this.showError('保存')
        }
      })
    },
    // 获取默认隐藏/显示列  初始化、刷新页面/恢复默认值 按钮方法
    getDefaultRow () {
      var _this = this
      queryAll(this.queryDefaultRowUrl, {}).then(response => {
        if (response.data.code == 0) {
          var result = 0
          var showflightfields = []
          var hiddenflightfields = _this.tableData.fields.slice(8)
          response.data.data.flightFields.forEach(item => {
            result = -1
            for (let i = 0; i < hiddenflightfields.length; i++) {
              if (hiddenflightfields[i].prop == item) {
                result = i
              }
            }
            if (result > -1) {
              hiddenflightfields[result].hidden = false
              showflightfields.push(hiddenflightfields[result])
              hiddenflightfields.splice(result, 1)
            }
          })
          hiddenflightfields.forEach(item => {
            item.hidden = true
          })
          _this.tableData.fields.splice(8, _this.tableData.fields.length - 8)
          _this.tableData.fields = _this.tableData.fields.concat(showflightfields, hiddenflightfields)

          var key = this.customOtherFields()
          var showotherFields = []
          var hiddenotherFields = this.tableData[key]
          response.data.data[key].forEach(item => {
            result = -1
            for (let i = 0; i < hiddenotherFields.length; i++) {
              if (hiddenotherFields[i].prop == item) {
                result = i
              }
            }
            if (result > -1) {
              hiddenotherFields[result].hidden = false
              showotherFields.push(hiddenotherFields[result])
              hiddenotherFields.splice(result, 1)
            }
          })
          hiddenotherFields.forEach(item => {
            item.hidden = true
          })
          this.tableData[key] = showotherFields.concat(hiddenotherFields)
          /* var showtaskfields = []
          var hiddentaskfields = _this.tableData.taskFields
          response.data.data.taskFields.forEach(item => {
            result = -1
            for (let i = 0; i < hiddentaskfields.length; i++) {
              if (hiddentaskfields[i].prop == item) {
                result = i
              }
            }
            if (result > -1) {
              hiddentaskfields[result].hidden = false
              showtaskfields.push(hiddentaskfields[result])
              hiddentaskfields.splice(result, 1)
            }
          })
          hiddentaskfields.forEach(item => {
            item.hidden = true
          }) */
          // _this.tableData.taskFields = showtaskfields.concat(hiddentaskfields)
          /* // 不排序更新隐藏/显示列方法
          var flightfields = response.data.data.flightFields
          var taskfields = response.data.data.taskFields
          var showflightfields = []
          var showtaskfields = []
          var result = 0
          for (let i = 8; i < this.tableData.fields.length; i++) {
            this.tableData.fields[i].hidden = true
            result = flightfields.indexOf(this.tableData.fields[i].prop)
            if (result > -1) {
              this.tableData.fields[i].hidden = false
              flightfields.splice(result, 1)
              if (flightfields.length == 0) break
            } else {

            }
          }
          for (let i = 0; i < this.tableData.taskFields.length; i++) {
            this.tableData.taskFields[i].hidden = true
            result = taskfields.indexOf(this.tableData.taskFields[i].prop)
            if (result > -1) {
              this.tableData.taskFields[i].hidden = false
              taskfields.splice(result, 1)
              if (taskfields.length == 0) break
            }
          } */
        }
        this.updateTableWidth()
      })
    },
    // 显示/隐藏列 eye点击事件
    handleEye (field, index, sign, isShow) {
      if (isShow) {
        field.hidden = false
      } else {
        field.hidden = !field.hidden
      }
      var widthSum = 0
      if (sign == 'left') {
        this.tableData.fields.forEach(item => {
          if (!item.hidden) {
            widthSum += parseInt(item.width)
          }
        })
        this.divLeftTableStyle.width = widthSum + 2 + 'px'
        this.divLeftTableStyle.minWidth = widthSum + 2 + 'px'
        this.divRightTableStyle.width = 'calc(100% - ' + this.divLeftTableStyle.width + ' - ' + this.divOprTableStyle.width + ')'
      } else if (sign == 'right') {
        var key = this.customOtherFields()
        var otherFieldsWidth = 0
        this.tableData[key].forEach(item => {
          if (!item.hidden) {
            otherFieldsWidth += parseInt(item.width)
          }
        })
        this.rightTableWidthStyle.width = otherFieldsWidth + 'px'
      }
      this.oprPopoverDirect = sign
      this.oprPopoverIndex = index
    },
    // 前置列 up点击事件
    handleUp (field, index, sign) {
      if (sign == 'left' && index > 8) {
        this.tableData.fields.splice(index, 1)
        this.tableData.fields.splice(index - 1, 0, field)
        this.oprPopoverIndex = index - 1
      } else if (sign == 'right' && index > 0) {
        var key = this.customOtherFields()
        this.tableData[key].splice(index, 1)
        this.tableData[key].splice(index - 1, 0, field)
        this.oprPopoverIndex = index - 1
      }
      this.oprPopoverDirect = sign
    },
    // 置顶列 top点击事件
    handleTop (field, index, sign) {
      if (sign == 'left' && index > 8) {
        this.tableData.fields.splice(index, 1)
        this.tableData.fields.splice(8, 0, field)
        this.oprPopoverIndex = 8
      } else if (sign == 'right' && index > 0) {
        var key = this.customOtherFields()
        this.tableData[key].splice(index, 1)
        this.tableData[key].splice(0, 0, field)
        this.oprPopoverIndex = 0
      }
      this.oprPopoverDirect = sign
    }
  }
}
</script>
