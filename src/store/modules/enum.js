export default {
  state: {
    classifyType: [],
    classifyCode: [
      {key: 'attr', classify: '属性', options: []},
      {key: 'isYOrN', classify: '是否', options: [{code: 'Y', name: '是'}, {code: 'N', name: '否'}]},
      {key: 'aircraftClassify', classify: '机型分类', options: []},
      {key: 'rank', classify: '机位等级', options: []},
      {key: 'airport', classify: '本场', options: []},
      {key: 'post', classify: '职务', options: []},
      {key: 'standType', classify: '机位类型', options: []},
      {key: 'abnormalReason', classify: '航班异常原因分类', options: []},
      {key: 'deviceType', classify: '终端设备类型', options: []},
      {key: 'vehicleStatus', classify: '车辆管理状态', options: []},
      {key: 'vehicleArea', classify: '车辆使用区域', options: []},
      {key: 'fuelType', classify: '燃料类型', options: []},
      {key: 'vmaintType', classify: '车辆维护类型', options: []},
      {key: 'temResourceType', classify: '航站楼资源', options: []},
      {key: 'taskType', classify: '任务类型', options: []},
      {key: 'category', classify: '航站楼区域类型', options: []},
      {key: 'fltType', classify: '进出标识', options: []},
      {key: 'runwayRank', classify: '跑道等级', options: []},
      {key: 'exceptionClassify', classify: '模板类型', options: []},
      {key: 'taskTmp', classify: '消息模板', options: []},
      {key: 'taskRolePerm', classify: '任务角色权限', options: []},
      {key: 'resourceType',
      classify: '功能资源',
      options: [
        {code: 1, name: '顶部菜单'},
        {code: 2, name: '菜单'},
        {code: 3, name: '按钮'}
      ]},
      {key: 'inOutType',
      classify: '进出港类型',
      options: [
        {code: '过站', name: '过站'},
        {code: '始发', name: '始发'},
        {code: '停场', name: '停场'}
      ]},
      {key: 'abnormalFlag',
      classify: '异常状态',
      options: [
        {code: 'N', name: '正常'},
        {code: 'Y', name: '异常'}
      ]},
      {key: 'gender',
      classify: '性别',
      options: [
        {code: 'M', name: '男'},
        {code: 'F', name: '女'}
      ]},
      {key: 'status',
      classify: '状态',
      options: [
        {code: 0, name: '启用'},
        {code: 1, name: '禁用'}
      ]},
      {key: 'msgType',
      classify: '消息发布类型',
      options: [
        {code: '1', name: '广播'},
        {code: '2', name: '单播'}
      ]}
    ],
    option: [],
    taskColOptions: []
  },
  getters: {
    getClassifyType: state => {
      return state.classifyType
    },
    getClassifyCode: state => {
      return state.classifyCode
    },
    getOption: state => {
      return state.option
    },
    getTaskColOption: state => {
      return state.taskColOptions
    }
  },
  mutations: {
    createEnum (state, data) {
      this.commit('setClassifyType', data.type)
      this.commit('setAllClassify', data.all)
    },
    setClassifyType (state, type) {
      state.classifyType = type
      if (state.classifyType.length) {
        state.classifyType.forEach(type => {
          var isExist = state.classifyCode.some(val => {
            return type === val.classify
          })
          if (!isExist) {
            state.classifyCode.push(
              {key: 'null', classify: type, options: []}
            )
          }
        })
      }
    },
    setAllClassify (state, all) {
      state.classifyCode.forEach(classify => {
        all.forEach(item => {
          if (item.classify === classify.classify) {
            classify.options.push(
              {code: item.code, name: item.name, sortkey: item.sortkey, remark: item.remark}
            )
          }
        })
      })
    },
    setOption (state, key) {
      var optionsTmp = []
      var temp = []
      state.classifyCode.forEach(item => {
        if (key === item.key) {
          optionsTmp = item.options
        }
      })
      optionsTmp.forEach(item => {
        temp.push({key: item.code, value: item.name, sortkey: item.sortkey, remark: item.remark})
      })
      state.option = temp
    },
    setTaskColOption (state, arr) {
      var temp = []
      arr.forEach(item => {
        temp.push({key: item.taskNo, label: item.taskCn})
      })
      state.taskColOptions = temp
    }
  },
  actions: {
  }
}
