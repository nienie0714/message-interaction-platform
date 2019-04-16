<script>
import { download, postData } from '../../api/base'
import basicMsgMixin from './basicMsgMixin'

export default {
  mixins: [basicMsgMixin],
  methods: {
    openWarnDel (deleteUrl, data) { // 警告 确认要删除这些数据吗？操作不可撤销-取消/删除
      const h = this.$createElement
      this.$msgbox({
        title: '警告',
        message: h('p', null, [
          h('i', {style: 'color: red'}, '确认删除选中数据吗？')
        ]),
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            setTimeout(() => {
              postData(deleteUrl, data).then(response => {
                if (response.data.code == 0) {
                  instance.confirmButtonLoading = false
                  done()
                } else {
                  instance.confirmButtonText = '删除'
                  instance.confirmButtonLoading = false
                  this.showError('删除')
                }
              })
            }, 400)
          } else {
            done()
          }
        }
      }).then(action => {
        this.showSuccess('删除')
        this.customMethod()
        this.queryDataReq()
      })
    },
    openInfoDel (deleteUrl, data) { // 警告 确认要删除这些数据吗？操作不可撤销-取消/删除
      const h = this.$createElement
      this.$msgbox({
        title: '警告',
        message: h('p', null, [
          h('i', {style: 'color: red'}, '确认删除选中数据吗？')
        ]),
        showCancelButton: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action == 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            setTimeout(() => {
              postData(deleteUrl, data).then(response => {
                this.showSuccess('删除')
                done()
              })
            }, 400)
          } else {
            done()
          }
        }
      }).then(action => {
        this.$message({
          type: 'info',
          message: 'action:' + action
        })
      })
    }
  }
}
</script>
