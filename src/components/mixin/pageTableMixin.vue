<script>
import { queryPageDataList } from '../../api/base'

export default {
  data () {
    return {
      // 分页参数
      pageData: {
        currentPage: 1,
        pageSizes: [10, 20, 30],
        pageSize: 10,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0
      },
      // 下载文件名
      fileName: '无线站坪调度基础数据导出.xls'
    }
  },
  mounted () {
    const that = this
    window.name = this.$route.name
    if (this.$route.matched[0].path == '/basicdata') {
      localStorage.setItem('basicName', this.$route.name)
    } else {
      localStorage.setItem('statName', this.$route.name)
    }
      // 下载文件名
    this.fileName = localStorage.getItem('basicdataName') + '.xls'
    this.$nextTick(() => {
      that.queryResourcePerm()
      var targetTop2 = this.$refs.basicTable.$refs.baseTable.$el.querySelector('.el-table__body-wrapper').getBoundingClientRect().top
      this.tableData.height = window.innerHeight - targetTop2 + 17
      var asideView = this.$root.$el.querySelector('.el-aside')
      var basicContView = this.$root.$el.querySelector('.basic-resource-contain')
      var basicWidth = window.innerWidth - asideView.offsetWidth - 40
      basicContView.style.width = basicWidth + 'px'
      window.onresize = () => {
        this.$nextTick(() => {
          return (() => {
            const targetTop = that.$refs.basicTable.$refs.baseTable.$el.querySelector('.el-table__body-wrapper').getBoundingClientRect().top
            that.tableData.height = window.innerHeight - targetTop + 17
            var basicWidth = window.innerWidth - asideView.offsetWidth - 40
            basicContView.style.width = basicWidth + 'px'
          })()
        })
      }
    })
  },
  methods: {
    // 发送分页查询请求
    queryDataReq () {
      /* this.tableData.loading = true */
      this.getQueryData()
      let data = {
        pageNum: this.pageData.currentPage ? this.pageData.currentPage : 1,
        pageSize: this.pageData.pageSize ? this.pageData.pageSize : 10,
        data: this.queryData
      }
      queryPageDataList(this.queryUrl, data).then(response => {
        this.setLastUpdateTime()
        /* this.tableData.loading = false */
        if (response.data.data.hasOwnProperty('rows')) {
          this.tableData.data = response.data.data.rows
          if (response.data.data.hasOwnProperty('total')) {
            this.pageData.total = response.data.data.total
          }
          this.customAfterQuery()
        }
      })
    },
    customAfterQuery () {
    },
    setLastUpdateTime () {
      var now = new Date()
      var hour = now.getHours()
      var min = now.getMinutes()
      var second = now.getSeconds()
      if (hour < 10) {
        hour = '0' + hour
      }
      if (min < 10) {
        min = '0' + min
      }
      if (second < 10) {
        second = '0' + second
      }
      var time = hour + ':' + min + ':' + second
      this.$store.commit('setLastUpdateTime', time)
    }
  }
}
</script>
