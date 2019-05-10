import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/view/home/MainView'
import Login from '@/view/home/LoginView'
import Home from '@/view/home/Home'
import Basic from '@/view/home/BasicResourceView'
import store from '../store'
import {postData, getQueryAll} from '../api/base'
import _ from 'lodash'

Vue.use(Router)

var router = new Router({
  routes: [
    {
      path: '/',
      name: '登录',
      component: Login
      /* redirect: to => {
        return { path: '/basic' }
      }, */
      /* component: DynamicFlightView, */
    },
    {
      path: '/basicdata',
      name: '基础数据',
      component: Home,
      beforeEnter: (to, from, next) => {
        var resource = []
        getQueryAll(`manage/sysResource/tree`).then(response => {
          resource = response.data.data
          localStorage.setItem('userResource', JSON.stringify(resource))
          next()
        })
        // let resource = [
        //   { 'id': '57e053214ead4a249de4a6ecca8f3261', 'text': '系统权限', 'state': null, 'checked': false, 'iconCls': 'menu-icon-perm', 'pid': null, 'path': null, 'attributes': '/perm', 'disabled': false, 'children': [{ 'id': '124d9800d39c4137ba37d296dc43bf2a', 'text': '系统角色', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e053214ead4a249de4a6ecca8f3261', 'path': null, 'attributes': '/basicdata/perm/role', 'disabled': false, 'children': null }, { 'id': '3f4a2c129a6f45b6a4e97a2d81064a9c', 'text': '系统用户', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e053214ead4a249de4a6ecca8f3261', 'path': null, 'attributes': '/basicdata/perm/user', 'disabled': false, 'children': null }, { 'id': '3f4a2c129a6f45b6a4e97a2d81064a45', 'text': '日志查询', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e0532454ead4a249de4a6ecca8f3263', 'path': null, 'attributes': '/basicdata/perm/log', 'disabled': false, 'children': null }, { 'id': '3f4a2c129a6f45b6a4e97a2d81064a9c2', 'text': '消费者管理', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e053214ead4a249de4a6ecca8f3262', 'path': null, 'attributes': '/basicdata/perm/consumer', 'disabled': false, 'children': null }, { 'id': '5c71bd06721f4e118d16c3ff5f12905a', 'text': '系统资源', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e053214ead4a249de4a6ecca8f3261', 'path': null, 'attributes': '/basicdata/perm/resource', 'disabled': false, 'children': null }, { 'id': '9ff45a5e886141de833e9acee7b278f9', 'text': '分类信息', 'state': null, 'checked': false, 'iconCls': null, 'pid': '57e053214ead4a249de4a6ecca8f3261', 'path': null, 'attributes': '/basicdata/perm/classify', 'disabled': false, 'children': null }] },
        //   { 'id': '648d3dc2cff9423ea651c70953572225', 'text': '消息管理', 'state': null, 'checked': false, 'iconCls': 'menu-icon-taskpool', 'pid': null, 'path': null, 'attributes': '/msg', 'disabled': false, 'children': [{ 'id': 'aa417e62f5ce4e9f8f2d78ed9a1ae5a4', 'text': '通告主题', 'state': null, 'checked': false, 'iconCls': null, 'pid': '648d3dc2cff9423ea651c70953572225', 'path': null, 'attributes': '/basicdata/msg/noticeTopic', 'disabled': false, 'children': null }, { 'id': 'a3ffc4e3584b45caa666249754c2f093', 'text': '预警设置', 'state': null, 'checked': false, 'iconCls': null, 'pid': '648d3dc2cff9423ea651c70953572225', 'path': null, 'attributes': '/basicdata/msg/alarmWarning', 'disabled': false, 'children': null }, { 'id': '0e89d3dc407d47bd839816dda5a0d8c1', 'text': '消息记录', 'state': null, 'checked': false, 'iconCls': null, 'pid': '648d3dc2cff9423ea651c70953572225', 'path': null, 'attributes': '/basicdata/msg/msgQuery', 'disabled': false, 'children': null }, { 'id': '0d212e302b244f10a4a3acfb1d5b614b', 'text': '消息绑定', 'state': null, 'checked': false, 'iconCls': null, 'pid': '648d3dc2cff9423ea651c70953572225', 'path': null, 'attributes': '/basicdata/msg/msgBind', 'disabled': false, 'children': null }, { 'id': '48eb12d150ed46869228faf007252898', 'text': '消息定义', 'state': null, 'checked': false, 'iconCls': null, 'pid': '648d3dc2cff9423ea651c70953572225', 'path': null, 'attributes': '/basicdata/msg/msgDefine', 'disabled': false, 'children': null }] }
        // ]
        // localStorage.setItem('userResource', JSON.stringify(resource))
      },
      children: [
        {
          path: 'perm',
          name: '权限',
          component: Basic,
          children: [
            {
              path: 'user',
              name: '用户管理',
              component: r => require.ensure([], () => r(require('@/view/basicResource/perm/UserView'), 'UserView'))
            },
            // {
            //   path: 'log',
            //   name: '系统日志',
            //   component: r => require.ensure([], () => r(require('@/view/basicResource/perm/LogView'), 'LogView'))
            // },
            {
              path: 'resource',
              name: '系统资源',
              component: r => require.ensure([], () => r(require('@/view/basicResource/perm/ResourceView'), 'ResourceView'))
            }
          ]
        },
        {
          path: 'msg',
          name: '消息管理',
          component: Basic,
          children: [
            {
              path: 'msgDefine',
              name: '消息定义',
              component: r => require.ensure([], () => r(require('@/view/basicResource/msg/MsgDefineView'), 'MsgDefineView')),
              props: true
            },
            {
              path: 'consumer',
              name: '消费者管理',
              component: r => require.ensure([], () => r(require('@/view/basicResource/msg/ConsumerView'), 'ConsumerView'))
            }
          ]
        }
      ]
    }
  ]
})

// router.beforeEach((to, from, next) => {
//   if (to.path != '/') {
//     var token = localStorage.getItem('token')
//     if (token && token != '') {
//       if (store.getters.getFirstTime) {
//         var type = []
//         var all = []
//         postData('basicdata/classifyCode/queryAllClassify', null).then(response => {
//           type = response.data.data
//           postData('basicdata/classifyCode/queryAll', {}).then(response => {
//             all = response.data.data
//             store.commit('createEnum', {'type': type, 'all': all})
//             next()
//           })
//         })
//         store.dispatch('changeInsTime')
//       } else {
//         next()
//       }
//     } else {
//       router.push({path: '/'})
//       next(false)
//     }
//   } else {
//     next()
//   }
// })

export default router
