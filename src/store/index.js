import Vue from 'vue'
import vuex from 'vuex'
import enumStore from './modules/enum'
import configStore from './modules/config'
import baseStore from './modules/baseStore'

Vue.use(vuex)

export default new vuex.Store({
  modules: {
    enum: enumStore,
    config: configStore,
    base: baseStore
  }
})
