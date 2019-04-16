<script>
import {getQueryAll} from '@/api/base.js'
import Stomp from 'stompjs'

export default {
  data () {
    return {
      client: null,
      intervalTime: 5 * 1000
    }
  },
  created () {
    this.connect()
  },
  mounted () {
    this.timer = setInterval(function () {
      getQueryAll('/', null).then(res => {
        if (res.data.status == 'OK') {
          console.log('请求成功')
        }
      })
    }, this.intervalTime)
  },
  methods: {
    connect () {
      this.$store.commit('setConfigValue', 'mqUrl')
      const wsURL = this.$store.getters.getConfigValue
      var ws = new WebSocket(wsURL)
      this.client = Stomp.over(ws)
      this.client.connect('aoms', 'aoms', this.onConnect, this.onError, '/aoms')
    },
    onConnect (x) {
      this.client.subscribe(`/queue/mqtt-subscription-${localStorage.getItem('empId')}qos1`, (msg) => {
        // var msg = data.data_exchangebody
        var data = JSON.parse(msg.body)
        this.customMqOnMessage(data)
      })
    },
    onError () {
      console.log('mq-error')
    }
  }
}
</script>
