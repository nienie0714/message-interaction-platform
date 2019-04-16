<template>
  <div class="pagination-view">
    <el-pagination @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.currentPage ? pageData.currentPage : 1"
      :page-sizes="pageData.pageSizes ? pageData.pageSizes : [10, 20, 50]"
      :page-size="pageData.pageSize ? pageData.pageSize : 10"
      :layout="pageData.layout ? pageData.layout : 'total, sizes, prev, pager, next, jumper'"
      :total="pageData.total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  props: ['pageData'],
  methods: {
    handleSizeChange (val) {
      this.$emit('sizeChange', {
        pageSize: val
      })
    },
    handleCurrentChange (val) {
      this.$emit('currentChange', {
        currentPage: val
      })
    }
  }
}
</script>

<style>
</style>
