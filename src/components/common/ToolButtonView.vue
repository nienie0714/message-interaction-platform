<template>
  <div class="tool-button-view">
    <div v-if="permissions.export" class="tool-div-button tool-export" title="导出" @click="handleDownloadTable"></div>
    <div v-if="permissions.delete&&selectionCount" class="tool-div-button tool-delete" title="批量删除" @click="handleDelete"></div>
    <div v-if="permissions.add" class="tool-div-button tool-add" title="新增" @click="handleAdd"></div>
    <slot name="button-slot-scope"></slot>
  </div>
</template>

<script>
export default {
  props: ['permissions', 'selectionCount'],
  methods: {
    handleDownloadTable () {
      this.$emit('handleDownload', {})
    },
    handleDelete () {
      this.$emit('handleDelete', null)
    },
    handleAdd () {
      this.$emit('handleAdd', {})
    }
  }
}
</script>

<style>
</style>
