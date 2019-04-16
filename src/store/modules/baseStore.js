export default {
  state: {
    firstTime: true,
    lastUpdateTime: ''
  },
  getters: {
    getFirstTime: state => {
      return state.firstTime
    },
    getLastUpdateTime: state => {
      return state.lastUpdateTime
    }
  },
  mutations: {
    changeInsTime (state) {
      state.firstTime = false
    },
    setLastUpdateTime (state, time) {
      state.lastUpdateTime = time
    }
  },
  actions: {
    changeInsTime (context) {
      context.commit('changeInsTime')
    }
  }
}
