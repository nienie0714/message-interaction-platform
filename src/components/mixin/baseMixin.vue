<script>
import {getQueryAll} from '../../api/base.js'

export default {
  data () {
    return {
      latestDate: '1900/01/01',
      latestTime: '00:00',
      latestWeek: '一',
      newTime: new Date(),
      intervalTime: 1000
    }
  },
  mounted () {
    var _this = this
    getQueryAll('/').then(res => {
      _this.newTime = new Date(res.headers.date)
      _this.timer = setInterval(this.refrushNowTime, this.intervalTime)
    })
  },
  methods: {
    // 定时器实时刷新当前时间
    refrushNowTime () {
      this.newTime = new Date(this.newTime.getTime() + this.intervalTime)
      var today = this.newTime
      var hour = this.addZero(today.getHours())
      var min = this.addZero(today.getMinutes())
      var now = `${hour}:${min}`
      if (now != this.latestTime) {
        this.latestTime = now
      }
      var dateStr = `${today.getFullYear()}/${this.addZero(today.getMonth() + 1)}/${this.addZero(today.getDate())}`
      if (dateStr != this.latestDate) {
        this.latestDate = dateStr
        this.latestWeek = '日一二三四五六'.charAt(new Date().getDay())
      }
    },
    addZero (value) {
      if (value < 10) {
        return `0${value}`
      } else {
        return value
      }
    },
    formatterTimeOfHM (time) {
      if (time) {
        var date = new Date(time)
        var hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
        var minite = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        return `${hour}:${minite}`
      } else {
        return '—:—'
      }
    }
  }
}
</script>
