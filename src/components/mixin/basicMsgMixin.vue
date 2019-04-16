<script>
export default {
  methods: {
    showSuccess (info) {
      let msg = info || '操作'
      this.$message({
        iconClass: 'a',
        customClass: 'msg-success',
        duration: 1500,
        dangerouslyUseHTMLString: true,
        message: `
          <div class="msg-box-cont show-success">
            <div class="msg-deco"><div class='img-title-deco'></div></div>
            <div class="msg-font"><p>` + msg + `成功 !</p></div>
            <div class="msg-deco"></div>
          </div>`
      })
    },
    showWarning (info, tip) {
      let msg = info || '操作'
      let msgTip = tip || '该项目为关键项，不可执行此操作 !'
      this.$message({
        iconClass: 'a',
        customClass: 'msg-warning',
        duration: 1500,
        dangerouslyUseHTMLString: true,
        message: `
          <div class="msg-box-cont show-warning">
            <div class="msg-deco"><div class='img-title-deco-red'></div></div>
            <div class="msg-font"><p>` + msg + `异常 !</p><p>` + msgTip + `</p></div>
            <div class="msg-deco"></div>
          </div>`
      })
    },
    showError (info, tip) {
      let msg = info || '操作'
      let msgTip = tip || '该项目为关键项，不可执行此操作 !'
      this.$message({
        iconClass: 'a',
        customClass: 'msg-error',
        duration: 1500,
        dangerouslyUseHTMLString: true,
        message: `
          <div class="msg-box-cont show-error">
            <div class="msg-deco"><div class='img-title-deco-red'></div></div>
            <div class="msg-font"><p>` + msg + `失败 !</p><p>` + msgTip + `</p></div>
            <div class="msg-deco"></div>
          </div>`
      })
    },
    showErrorCustom (info, tip) {
      let msg = info
      let msgTip = tip
      this.$message({
        iconClass: 'a',
        customClass: 'msg-error',
        duration: 1500,
        dangerouslyUseHTMLString: true,
        message: `
          <div class="msg-box-cont show-error">
            <div class="msg-deco"><div class='img-title-deco-red'></div></div>
            <div class="msg-font"><p>` + msg + `</p><p>` + msgTip + `</p></div>
            <div class="msg-deco"></div>
          </div>`
      })
    },
    showInfo (info) {
      this.$message(info)
    }
  }
}
</script>
