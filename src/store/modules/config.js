export default {
  state: {
    configs: [
      {key: 'wsUrl', classify: 'websocket_url', name: 'aoms-job', value: ''},
      {key: 'mqUrl', classify: 'web_mq_url', name: 'aoms-webmq', value: ''},
      {key: 'dfsUrl', classify: 'download_url', name: 'aoms-dfs', value: ''}
    ],
    configValue: ''
  },
  getters: {
    getConfigs: state => {
      return state.configs
    },
    getConfigValue: state => {
      return state.configValue
    }
  },
  mutations: {
    setConfigs (state, all) {
      state.configs.forEach(config => {
        all.forEach(item => {
          if ((item.paramClassify === config.classify) && (item.paramName === config.name)) {
            config.value = item.paramValue
          }
        })
      })
    },
    setConfigValue (state, key) {
      for (var i = 0; i < state.configs.length; i++) {
        if (key === state.configs[i].key) {
          state.configValue = state.configs[i].value
          return
        }
      }
    }
  },
  actions: {
  }
}
