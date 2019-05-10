<script>
import WarningBoxView from '../common/WarningBoxView'
import { postData, putData, delData, download, queryAll } from '../../api/base'
import _ from 'lodash'
import basicMsgBoxMixin from './basicMsgBoxMixin'

export default {
  components: {
    WarningBoxView
  },
  mixins: [basicMsgBoxMixin],
  data () {
    return {
      // 请求路径
      queryUrl: '',
      // 新增路径
      addUrl: '',
      // 编辑路径
      editUrl: '',
      // 删除路径
      deleteUrl: '',
      // 下载路径
      exportUrl: '',
      // 查询组件按行分组
      queryRowGroup: [],
      // 请求的查询参数
      queryData: {},
      // 获取菜单按钮权限路径
      getResourcePerm: 'basicdata/sysUser/queryResourceByUserAndPath',
      // 菜单对应按钮权限
      permissions: {
        add: false,
        update: false,
        delete: false,
        export: false
      },
      deleteData: {
        visible: false,
        loading: false,
        width: '500px',
        class: ' dialog-delete-warn',
        info: '确认要删除所选数据吗？',
        data: null
      },
      clickTime: '00:00'
    }
  },
  created () {
    if (!this.queryUrl || this.queryUrl == '') {
      this.queryUrl = this.baseUrl + '/pageQuery'
    }
    if (!this.addUrl || this.addUrl == '') {
      // this.addUrl = this.baseUrl + '/save'
      this.addUrl = this.baseUrl
    }
    if (!this.editUrl || this.editUrl == '') {
      // this.editUrl = this.baseUrl + '/update'
      this.editUrl = this.baseUrl
    }
    if (!this.deleteUrl || this.deleteUrl == '') {
      // this.deleteUrl = this.baseUrl + '/delete'
      this.deleteUrl = this.baseUrl
    }
    // if (!this.exportUrl || this.exportUrl == '') {
    //   this.exportUrl = this.baseUrl + '/exportExcel'
    // }
    if (!this.resetUrl || this.resetUrl == '') {
      this.resetUrl = this.baseUrl + '/resetPsd'
    }
    if (!this.pwUrl || this.pwUrl == '') {
      this.pwUrl = this.baseUrl + '/updatePassword'
    }
    this.getQueryOptions()
    this.queryRowGroup = this.rowGroup()
    this.queryDataReq()
  },
  mounted () {
    var _this = this
    this.$nextTick(() => {
      // _this.queryResourcePerm()
    })
  },
  methods: {
    // 自定义方法
    customMethod () {},
    // 自定义追加查询条件（按钮查询事件）
    customQueryMethod () {},
    // 获取按钮权限
    queryResourcePerm () {
      let data = {
        keyPath: this.$route.path
      }
      // let _this = this
      // queryAll(this.getResourcePerm, data).then(res => {
      //   if (res.data.code == 0) {
      //     res.data.data.forEach(item => {
      //       _this.permissions[item] = true
      //     })
      //   }
      // })
      let pms = ['add', 'update', 'reset', 'cgPwd', 'detail', 'delete', 'upMq', 'upMqAll']
      _.forEach(pms, item => {
        this.permissions[item] = true
      })
    },
    // 获取最新时间
    getClickTime () {
      let date = new Date()
      this.clickTime = date
    },
    // 唯一性校验
    unique (rule, value, callback) {
      if (value != '' && value != null) {
        setTimeout(() => {
          let key = rule.field
          let data = {}
          this.$set(data, rule.field, value)
          postData(this.baseUrl + '/checkExist', data).then(response => {
            if (response.data.code == 0 && response.data.data.hasOwnProperty('exist')) {
              if (response.data.data.exist > 0) {
                callback(new Error('当前编号已存在'))
              } else {
                callback()
              }
            } else {
              callback(new Error('请求失败'))
            }
          })
        }, 200)
      } else {
        callback()
      }
    },
    // 唯一性校验
    uniqueEdit (rule, value, callback) {
      if (value != '' && value != null) {
        var index = _.findIndex(this.formData.formData, ['key', rule.field])
        if (this.formData.formData[index].hasOwnProperty('value') && this.formData.formData[index].value != value) {
          let key = rule.field
          let data = {}
          this.$set(data, rule.field, value)
          postData(this.baseUrl + '/checkExist', data).then(response => {
            if (response.data.code == 0 && response.data.data.hasOwnProperty('exist')) {
              if (response.data.data.exist > 0) {
                callback(new Error('当前编号已存在'))
              } else {
                callback()
              }
            } else {
              callback(new Error('请求失败'))
            }
          })
        } else if (!this.formData.formData[index].hasOwnProperty('value')) {
          this.unique(rule, value, callback)
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    // 唯一性校验
    uniqueKey (rule, value, callback) {
      if (value != '' && value != null) {
        setTimeout(() => {
          let key = rule.field
          let data = {}
          this.$set(data, rule.field, value)
          for (var i = 0; i < this.formData.formData.length; i++) {
            if (this.formData.formData[i].key == this.formData.key) {
              if (this.formData.formData[i].value != null) {
                this.$set(data, this.formData.key, this.formData.formData[i].value)
                break
              }
            }
          }
          postData(this.baseUrl + '/checkExist', data).then(response => {
            if (response.data.code == 0 && response.data.data.hasOwnProperty('exist')) {
              if (response.data.data.exist > 0) {
                callback(new Error('当前编号已存在'))
              } else {
                callback()
              }
            } else {
              callback(new Error('请求失败'))
            }
          })
        }, 200)
      } else {
        callback()
      }
    },
    // 清空查询参数并发送查询请求
    cleanQueryData () {
      var data = this.queryList
      this.queryList.forEach((item, index) => {
        if (item.hasOwnProperty('defaultValue')) {
          data[index].value = item.defaultValue
        } else {
          if (typeof (item.value) == 'number') {
            data[index].value = null
          } else if (typeof (item.value) == 'string') {
            data[index].value = null
          } else if (typeof (item.value) == 'boolean') {
            data[index].value = false
          } else if (typeof (item.value) == 'undefined') {
            data[index].value = item.value
          } else {
            data[index].value = null
          }
        }
      })
      this.queryList = data
      this.queryDataReq()
    },
    // 获取查询条件中按钮的options
    getQueryOptions () {
      this.queryList.forEach(item => {
        if (item.hasOwnProperty('tabsKey')) {
          this.$store.commit('setOption', item.tabsKey)
          var temp = this.$store.getters.getOption
          if (item.hasOwnProperty('options')) {
            item.options = item.options.concat(temp)
          } else {
            this.$set(item, 'options', temp)
          }
        }
      })
    },
    // 行分组
    rowGroup (arr) {
      if (arr) {
        return _.chunk(arr, this.colSize)
      } else {
        return _.chunk(this.queryList, this.colSize)
      }
    },
    // 获取查询参数
    getQueryData (arr) {
      var data = {}
      if (arr) {
        arr.forEach(item => {
          if (item.value === '') {
            this.$set(data, item.key, null)
          } else {
            this.$set(data, item.key, item.value)
          }
        })
        this.queryData = data
        return data
      } else {
        this.queryList.forEach(item => {
          if (item.value === '') {
            this.$set(data, item.key, null)
          } else {
            this.$set(data, item.key, item.value)
          }
        })
        this.queryData = data
      }
      this.customQueryBefore()
    },
    customQueryBefore () {},
    // 新增
    handleAdd () {
      this.formData.title = '新增'
      this.formData.visible = true
    },
    // 编辑
    handleEdit (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].type == 'dateRangePicker') {
          let data = {}
          this.$set(data, this.formData.formData[i].key1, null)
          this.$set(data, this.formData.formData[i].key2, null)
          this.$set(this.formData.formData[i], 'value', data)
          this.formData.formData[i].value[this.formData.formData[i].key1] = row[this.formData.formData[i].key1]
          this.formData.formData[i].value[this.formData.formData[i].key2] = row[this.formData.formData[i].key2]
        } else {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        }
      }
      this.formData.title = '编辑'
      this.formData.visible = true
    },
    // 详情
    handleDetail (row) {
      for (let i = 0; i < this.formData.formData.length; i++) {
        if (this.formData.formData[i].type == 'dateRangePicker') {
          let data = {}
          this.$set(data, this.formData.formData[i].key1, null)
          this.$set(data, this.formData.formData[i].key2, null)
          this.$set(this.formData.formData[i], 'value', data)
          this.formData.formData[i].value[this.formData.formData[i].key1] = row[this.formData.formData[i].key1]
          this.formData.formData[i].value[this.formData.formData[i].key2] = row[this.formData.formData[i].key2]
        } else {
          this.$set(this.formData.formData[i], 'value', row[this.formData.formData[i].key])
        }
      }
      this.formData.title = '详情'
      this.formData.visible = true
    },
    // 联合主键删除
    handleMultKeyDelete (row) {
      let data = []
      if (row) {
        data.push(row)
      } else {
        data = this.tableData.multipleSelection
      }
      this.deleteData.data = data
      this.deleteData.visible = true
    },
    // 删除
    handleDelete (row) {
      let data = []
      if (row) {
        data.push(row[this.tableData.key])
      } else {
        this.tableData.multipleSelection.forEach(item => {
          data.push(item[this.tableData.key])
        })
      }
      this.deleteData.data = data.join(',')
      this.deleteData.visible = true
      document.addEventListener('keypress', this.handleDeleteConfirm, false)
    },
    handleDeleteConfirm (event) {
      if ((event && event.keyCode == 13) || !event) {
        this.deleteData.loading = true
        delData(this.deleteUrl, this.deleteData.data).then(response => {
          if (response.data.code == 0) {
            this.showSuccess('删除')
            this.customMethod()
            this.queryDataReq(1)
            this.handleDeleteClose()
          } else {
            this.showError('删除', response.data.msg)
          }
          this.deleteData.loading = false
        }).catch(() => {
          this.deleteData.loading = false
        })
      }
    },
    handleDeleteClose () {
      this.deleteData.visible = false
      this.deleteData.loading = false
      document.removeEventListener('keypress', this.handleDeleteConfirm)
    },
    // 下载
    handleDownload (total) {
      if (!_.isEmpty(total)) {
        download(this.exportUrl, this.queryData, total).then(response => {
          this.showSuccess('导出')
          this.downFile(response, this.fileName)
        })
      } else {
        download(this.exportUrl, this.queryData, this.pageData.total).then(response => {
          this.showSuccess('导出')
          this.downFile(response, this.fileName)
        })
      }
    },
    // 新增/编辑前操作
    customSaveBefore (data) {
      return data
    },
    // 发送新增保存请求
    saveAdd (data) {
      var obj = this.customSaveBefore(data)
      if (obj != null) {
        postData(this.addUrl, obj).then(response => {
          if (response.data.code == 0) {
            this.formData.visible = false
            this.showSuccess('新增')
            this.customMethod()
            this.queryDataReq()
          } else {
            this.showError('新增数据', response.data.msg)
          }
          this.formData.loading = false
        })
      } else {
        this.formData.loading = false
      }
    },
    // 发送编辑保存请求
    saveEdit (data) {
      var obj = this.customSaveBefore(data)
      if (obj != null) {
        putData(this.editUrl, obj).then(response => {
          if (response.data.code == 0) {
            this.formData.visible = false
            this.showSuccess('编辑')
            this.customMethod()
            this.queryDataReq()
          } else {
            this.showError('编辑保存', response.data.msg)
          }
          this.formData.loading = false
        })
      } else {
        this.formData.loading = false
      }
    },
    // Blob文件转换下载
    downFile (result, fileName, fileType) {
      var data = result.data
      let type
      if (fileType) {
        type = fileType
      } else {
        type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
      var blob = new Blob([data], { type: type })
      var objectUrl = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.setAttribute('style', 'display:none')
      a.setAttribute('href', objectUrl)
      a.setAttribute('download', fileName)
      a.click()
      URL.revokeObjectURL(objectUrl)
    },
    // 分页条数变化
    handleSizeChange (val) {
      this.pageData.pageSize = val.pageSize
      this.queryDataReq()
    },
    // 分页页码变化
    handleCurrentChange (val) {
      this.pageData.currentPage = val.currentPage
      this.queryDataReq()
    },
    // 格式化 YYYY-MM-DD HH:MM
    formatterDayMin (row, column) {
      let arr = row[column.property].substr(0, 16).split('T')
      return arr.join(' ')
    },
    // 格式化 YYYY-MM-DD
    formatterDay (row, column) {
      return row[column.property] ? row[column.property].substr(0, 10) : ''
    },
    // 格式化 HH:MM:SS
    formatterTime (row, column) {
      return row[column.property] ? row[column.property].substr(11, 8) : ''
    },
    // 格式化 HH:MM
    formatterMin (row, column) {
      return row[column.property] ? row[column.property].substr(11, 5) : ''
    },
    // 超出设置长度省略字符变为...
    substrValue (value, length) {
      if (value) {
        if (value.length > length) {
          return value.substr(0, length - 1) + '...'
        }
      }
      return value
    },
    // 拼接数组
    spliceArr (item, sign) {
      if (item) {
        var count = 0
        item.forEach((value, index) => {
          if (value == null || value == '' || value == 'null') {
            count++
            item[index] = null
          }
        })
        if (count == item.length) {
          return '—'
        } else {
          return item.join(sign)
        }
      } else {
        return item
      }
    },
    eventStop (event) {
      event.preventDefault()
      event.stopPropagation()
    },
    oprSortkeyReg (value) {
      if (value != '' && value != null) {
        let reg = /^([1-9]\d{0,2})?$/
        if (!reg.test(value)) {
          return '必须由0-3位正整数组成'
        } else {
          return false
        }
      } else {
        return false
      }
    },
    oprRefTimeReg (value) {
      if (value != '' && value != null) {
        let reg = /^(-?(([1-9]{1}\d{0,2})|(0{1})))?$/
        if (!reg.test(value)) {
          return '必须由0-3位整数组成'
        } else {
          return false
        }
      } else {
        return false
      }
    }
  }
}
</script>
