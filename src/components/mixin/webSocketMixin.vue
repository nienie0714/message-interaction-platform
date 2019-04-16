<script>
export default {
  data () {
    return {
      ws: null
    }
  },
  created () {
    this.initWebSocket()
  },
  destroyed () {
    this.websocketClose()
  },
  methods: {
    // 初始化websocket
    initWebSocket () {
      this.$store.commit('setConfigValue', 'wsUrl')
      const wsURL = this.$store.getters.getConfigValue
      this.ws = new WebSocket(wsURL)
      this.ws.onopen = this.websocketOnOpen
      this.ws.onerror = this.websocketOnError
      this.ws.onmessage = this.websocketOnMessage
      this.ws.onclose = this.websocketClose
    },
    // 连接websocket
    websocketOnOpen () {
      console.log('websocket连接成功！ws')
    },
    // websocket错误
    websocketOnError (e) {
      console.log('websocket错误信息：' + e)
    },
    // websocket消息
    websocketOnMessage (e) {
      var resData = JSON.parse(e.data)
      console.log(resData)
      this.customWsOnMessage(resData)
    },
    // 关闭websocket
    websocketClose (e) {
      console.log('websocket关闭信息：' + e)
      this.initWebSocket()
    }
  }
}
</script>
