import Vue from 'vue'

var vue = new Vue({})

export function queryPageDataList (url, data) {
  return vue.axios({
    url: url,
    method: 'post',
    data: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      data: data.data
    }
  })
}

export function getQueryAll (url, data) {
  return vue.axios({
    url: url,
    method: 'get',
    data: data
  })
}

export function postDataEndPage (urls, datas) {
  var arr = []
  urls.forEach((url, index) => {
    if (index == urls.length - 1) {
      arr.push(queryPageDataList(url, datas[index]))
    } else {
      arr.push(postData(url, datas[index]))
    }
  })
  return vue.axios.all(arr)
}

export function postAllData (urls, datas) {
  var arr = []
  urls.forEach((url, index) => {
    arr.push(postData(url, datas[index]))
  })
  return vue.axios.all(arr)
}

export function postData (url, data) {
  return vue.axios({
    url: url,
    method: 'post',
    data: data
  })
}

export function putData (url, data) {
  return vue.axios({
    url: url,
    method: 'put',
    data: data
  })
}

export function delData (url, data) {
  return vue.axios({
    url: url + `/${data}`,
    method: 'delete'
  })
}

export function postDataNone (url, data) {
  return vue.axiosNone({
    url: url,
    method: 'post',
    data: data
  })
}

export function postDataOther (url, data) {
  return vue.axiosOther({
    url: url,
    method: 'post',
    data: data
  })
}

export function download (url, data, pageSize) {
  return vue.axios({
    url: url,
    method: 'post',
    responseType: 'blob',
    data: {
      data: data,
      pageSize: pageSize,
      pageNum: 1
    }
  })
}

export function downloadFile (url) {
  return vue.axios({
    url: url,
    method: 'get',
    responseType: 'blob'
  })
}

export function queryAll (url, data) {
  if (!data) {
    data = {}
  }
  return vue.axios({
    url: url,
    method: 'post',
    data: data
  })
}

export function dfsPost (url, data, callback) {
  return vue.dfs({
    url: url,
    method: 'post',
    data: data,
    onUploadProgress: progressEvent => {
      var complete = (progressEvent.loaded / progressEvent.total * 100 | 0)
      callback(complete)
      /* console.log(complete) // 进度值
      this.onprogress = complete */
    }
  })
}

export function queryClassifyType () {
  return ['任务角色权限', '消息模板', '机型分类', '本场', '职务', '车辆管理状态', '航站楼资源', '任务类型', '航站楼区域类型', '跑道等级', '进出标识', '机位等级', '心跳时间', '燃料类型', '通知公告类型', '属性', '模板类型', '航班异常原因分类', '车辆使用区域', '机位类型', '终端设备类型', '班期季节', '车辆维护类型']
  // postData('basicdata/classifyCode/queryAllClassify', null).then(response => {
  //   return response.data.data
  // })
}

export function queryAllClassify () {
  return [{'code': 'N', 'classify': '任务类型', 'name': '普通任务', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'S', 'classify': '任务类型', 'name': '特殊任务', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'V', 'classify': '任务类型', 'name': '特车任务', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'R', 'classify': '任务角色权限', 'name': '调度员', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'W', 'classify': '任务角色权限', 'name': '一线员工', 'sortkey': null, 'remark': '任务角色权限', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'D', 'classify': '属性', 'name': '国内', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'I', 'classify': '属性', 'name': '国际', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'M', 'classify': '属性', 'name': '混合', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'R', 'classify': '属性', 'name': '地区', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'CLEARNOTICE_TIMR', 'classify': '心跳时间', 'name': '清除生产公告时间', 'sortkey': null, 'remark': '1', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'HEARTBEAT_TIMR', 'classify': '心跳时间', 'name': '心跳时间', 'sortkey': null, 'remark': '8', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'INC', 'classify': '本场', 'name': '银川机场', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'B', 'classify': '机位等级', 'name': 'B', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'C', 'classify': '机位等级', 'name': 'C', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'D', 'classify': '机位等级', 'name': 'D', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'E', 'classify': '机位等级', 'name': 'E', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'F', 'classify': '机位等级', 'name': 'F', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'C', 'classify': '机位类型', 'name': '组合子机位', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'H', 'classify': '机位类型', 'name': '机库机位', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'N', 'classify': '机位类型', 'name': '普通机位', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'P', 'classify': '机位类型', 'name': '组合父机位', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T', 'classify': '机位类型', 'name': '临时机位', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'A', 'classify': '机型分类', 'name': 'A', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'B', 'classify': '机型分类', 'name': 'B', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'C', 'classify': '机型分类', 'name': 'C', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'D', 'classify': '机型分类', 'name': 'D', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'E', 'classify': '机型分类', 'name': 'E', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'F', 'classify': '机型分类', 'name': 'F', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'TASK-ABNORMAL', 'classify': '模板类型', 'name': '任务异常', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'TASK-CANCEL', 'classify': '模板类型', 'name': '任务撤销', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'TASK-REFUSE', 'classify': '模板类型', 'name': '任务拒绝', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'alarm.warning', 'classify': '消息模板', 'name': '告警消息', 'sortkey': null, 'remark': '{flight_no}航班{task_cn}任务的{operation_cn}操作发生{warning_level}级预警，任务执行单元/人：{name}。', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'notice.all', 'classify': '消息模板', 'name': '生产公告-全部', 'sortkey': null, 'remark': '{notice_topic}：{notice_content}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'notice.spec', 'classify': '消息模板', 'name': '生产公告-部门/科室', 'sortkey': null, 'remark': '{notice_topic}：{notice_content}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.accept', 'classify': '消息模板', 'name': '任务接受', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务已接受，接受人:{emp_name},操作时间:{receive_time}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.distribution', 'classify': '消息模板', 'name': '任务派发', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务已派发，派发人:{emp_name}，派发时间:{operation_time}。', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.endOperation', 'classify': '消息模板', 'name': '任务反馈', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务{operation_name}操作完成，操作人:{emp_name},操作时间:{operation_time}。', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.exception', 'classify': '消息模板', 'name': '任务异常', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务异常，提交人:{emp_name}，提交时间:{exception_time}。', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.recalltask', 'classify': '消息模板', 'name': '任务撤销', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务已撤销，撤销人:{emp_name}，撤销时间:{operation_time}。', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.refuse', 'classify': '消息模板', 'name': '任务拒绝', 'sortkey': null, 'remark': '{flt_no}航班{task_name}任务已拒绝,拒绝人:{emp_name},操作时间:{refuse_time}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'task.timechange', 'classify': '消息模板', 'name': '任务时间变更', 'sortkey': null, 'remark': '{warn_content}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'DIESEL', 'classify': '燃料类型', 'name': '柴油', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'ELECTRIC', 'classify': '燃料类型', 'name': '电力', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'GASOLINE', 'classify': '燃料类型', 'name': '汽油', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'N', 'classify': '班期季节', 'name': '夏秋', 'sortkey': null, 'remark': '{"beginDate":"2019-03-31","endDate":"2019-10-26"}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'Y', 'classify': '班期季节', 'name': '冬春', 'sortkey': null, 'remark': '{"beginDate":"2019-10-27","endDate":"2020-03-28"}', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'M1', 'classify': '终端设备类型', 'name': 'M1', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'S65', 'classify': '终端设备类型', 'name': 'S65', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T80', 'classify': '终端设备类型', 'name': 'T80', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T90', 'classify': '终端设备类型', 'name': 'T90', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-0', 'classify': '职务', 'name': '一线员工', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-1', 'classify': '职务', 'name': '调度员', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-2', 'classify': '职务', 'name': '一线员工/调度员', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-3', 'classify': '职务', 'name': '班组长', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-4', 'classify': '职务', 'name': '科室主管/业务主管', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-5', 'classify': '职务', 'name': '科室领导/业务高级主管', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-6', 'classify': '职务', 'name': '部门领导', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-7', 'classify': '职务', 'name': '部门主持工作', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-8', 'classify': '职务', 'name': '公司领导', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'POST-9', 'classify': '职务', 'name': '公司主持工作', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'AIRLINE', 'classify': '航班异常原因分类', 'name': '航空公司', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'AIRPORT', 'classify': '航班异常原因分类', 'name': '机场', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'MILITARY', 'classify': '航班异常原因分类', 'name': '军事活动', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'WEATHER', 'classify': '航班异常原因分类', 'name': '天气', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T1A', 'classify': '航站楼区域类型', 'name': 'T1A区域', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T2B', 'classify': '航站楼区域类型', 'name': 'T2B区域', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'T3C', 'classify': '航站楼区域类型', 'name': 'T3C区域', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'BELT', 'classify': '航站楼资源', 'name': '行李提取转盘', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'CHANNEL', 'classify': '航站楼资源', 'name': '安检通道', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'CHUTE', 'classify': '航站楼资源', 'name': '行李滑槽', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'COUNTER', 'classify': '航站楼资源', 'name': '值机柜台', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'A', 'classify': '跑道等级', 'name': 'A', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null},
  {'code': 'B', 'classify': '跑道等级', 'name': 'B', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'C', 'classify': '跑道等级', 'name': 'C', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'D', 'classify': '跑道等级', 'name': 'D', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'E', 'classify': '跑道等级', 'name': 'E', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'F', 'classify': '跑道等级', 'name': 'F', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'AIRPORT', 'classify': '车辆使用区域', 'name': '机场', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'FLIGHT_AREA', 'classify': '车辆使用区域', 'name': '飞行区', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'PUBLIC_AREA', 'classify': '车辆使用区域', 'name': '公共区', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'TERMINAL', 'classify': '车辆使用区域', 'name': '航站楼', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'REPAIR', 'classify': '车辆管理状态', 'name': '维修', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'SCRAP', 'classify': '车辆管理状态', 'name': '报废', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'USE', 'classify': '车辆管理状态', 'name': '在用', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'VEHICLE.MAINTAIN.TYPE.M', 'classify': '车辆维护类型', 'name': '维修', 'sortkey': null, 'remark': '1', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'VEHICLE.MAINTAIN.TYPE.R', 'classify': '车辆维护类型', 'name': '加油', 'sortkey': null, 'remark': '2', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'VEHICLE.MAINTAIN.TYPE.S', 'classify': '车辆维护类型', 'name': '保养', 'sortkey': null, 'remark': '0', 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'A', 'classify': '进出标识', 'name': '进港', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'D', 'classify': '进出标识', 'name': '出港', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'NOTICE.FLIGHT', 'classify': '通知公告类型', 'name': '航班通知', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}, {'code': 'NOTICE.TASK', 'classify': '通知公告类型', 'name': '任务通知', 'sortkey': null, 'remark': null, 'reserved1': null, 'reserved2': null, 'reserved3': null}]
  // postData('basicdata/classifyCode/queryAll', {}).then(response => {
  //   return response.data.data
  // })
}
