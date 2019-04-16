<template>
  <div>
    <div v-for="rowGroup in data" :key="rowGroup.index">
      <el-row :gutter="24">
        <Items-view v-for="item in rowGroup" :key="item.key" :data="item" @change="changeHandle" @keyupEnter="$emit('keyupEnter')"></Items-view>
      </el-row>
    </div>
  </div>
</template>

<script>
import ItemsView from './ItemsView'
export default {
  components: {
    ItemsView
  },
  props: {
    data: Array
  },
  methods: {
    changeHandle (data, selectedValue) {
      this.$emit('change', {
        data: data,
        selectedValue: selectedValue
      })
    }
  }
}
</script>
