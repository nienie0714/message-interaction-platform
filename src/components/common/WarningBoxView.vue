<template>
  <el-dialog :visible.sync="data.visible" :close-on-click-modal="false" :width="data.width" append-to-body :class="'other-dialog' + data.class">
    <div slot="title" class="dialog-header">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">{{data.title?data.title:'警告'}}</span>
    </div>
    <div class="dialog-body">
      <div>
        <div class="cancel-warn-img"></div>
      </div>
      <div><p class="other-dialog-cont">{{data.info?data.info:'确认执行此操作？'}}</p></div>
      <div><p class="other-dialog-tip">{{data.warning?data.warning:'操作不可恢复'}}</p></div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="data.loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ['data'],
  methods: {
    handleClose () {
      this.data.visible = false
      this.data.loading = false
    },
    handleConfirm () {
      this.$emit('handleConfirm')
    }
  }
}
</script>
