'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"http://10.254.0.116:8094/"',
  WS_API: '"ws://10.254.0.115:9099/aoms-job/socket/dynamicflight"'
})
