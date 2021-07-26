const mqtt = require('mqtt')
const fs = require('fs')
const path = require('path')
import {nodeid, ctrltopic, mqtt_host} from "./config"

export function start_mqtt_server(onEvent) {
    const client  = mqtt.connect(`mqtt://${mqtt_host}:1883/`)

    client.on('connect', function () {
      client.subscribe('switch/#', function (err) {
        if (!err) {
          client.publish('presence', 'Hello mqtt')
        }
      })
    })

    let handlers = {}
    const evtlog = fs.createWriteStream('evtlog.jsonl', {flags: 'a'})
    const uptimelog = fs.createWriteStream('uptime.jsonl', {flags: 'a'})
    const timeout = 5000

    client.on('message', function (topic, message) {
      const ma = topic.match(/^switch[\/](NODE-[^\/]{6})[\/]status/)
      const msg = message.toString().match(/^uptime=(\d+) rssi=([-\d]+) ch0=(\d+)/)
      console.log(ma)
      console.log(msg)
      if (ma && msg) {
          const payload = {
              ts: new Date(),
              node: ma[1],
              uptime: msg[1],
              rssi: msg[2],
              ch0: msg[3],
          }
          console.log(payload)
          evtlog.write(JSON.stringify(payload)+'\n')
        
          handlers[payload.node] = handlers[payload.node] || {}

          if (handlers[payload.node].tmr) {
              clearTimeout(handlers[payload.node].tmr)
              handlers[payload.node].tmr = null
          }

          handlers[payload.node].tmr = setTimeout(()=>{
              console.log(`Got event: `, payload)
              uptimelog.write(JSON.stringify(payload)+'\n')
              onEvent(payload)
          }, timeout)

      }
      // message is Buffer
      console.log(message.toString())
      //client.end()
    })
    return client;
}

