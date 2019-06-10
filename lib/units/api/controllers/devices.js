var _ = require('lodash')
var Promise = require('bluebird')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')

var log = logger.createLogger('api:controllers:devices')

module.exports = {
  getDevices: getDevices
, getDeviceBySerial: getDeviceBySerial
}

function getDevices(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadDevices()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          list.forEach(function(device) {
            datautil.normalize(device, req.user)
            var responseDevice = device

            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }

            var devices_users = {
              'a0000055e238bd': '张智磊','358686071785103': '朱泽文','866968024739410': '陈瑞龙','863092038731884': '谭羽哲',
              // 'A000005680CEC4': '宗志龙',
            }

            if(req.user && responseDevice && responseDevice.present){
              var imei = responseDevice.phone?responseDevice.phone:null
              responseDevice.product = imei?devices_users[imei] || '未知':"未知"
              switch (req.user.email) {
                case '13501284416@163.com':
                  deviceList.push(responseDevice)
                  break
                case 'zzl@pingwest.com':
                  if(responseDevice.phone && responseDevice.phone.imei === 'a0000055e238bd'){
                    deviceList.push(responseDevice)
                  }
                  break
                case 'zzw@pingwest.com':
                  if(responseDevice.phone && responseDevice.phone.imei === '358686071785103'){
                    deviceList.push(responseDevice)
                  }
                  break
                case 'crl@pingwest.com':
                  if(responseDevice.phone && responseDevice.phone.imei === '866968024739410'){
                    deviceList.push(responseDevice)
                  }
                  break
                case 'tyz@pingwest.com':
                  if(responseDevice.phone && responseDevice.phone.imei === '863092038731884'){
                    deviceList.push(responseDevice)
                  }
                  break
              }
            }

          })

          res.json({
            success: true
          , devices: deviceList
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device list: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value
  var fields = req.swagger.params.fields.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      var responseDevice = device

      if (fields) {
        responseDevice = _.pick(device, fields.split(','))
      }

      res.json({
        success: true
      , device: responseDevice
      })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}
