const mqtt = require('mqtt')
const fs = require('fs')
const path = require('path')
import {nodeid, ctrltopic, mqtt_host, lastwill_timeout, output_dir} from "./config"
import {WaterPumpEvent} from './models'

export interface MqttEventHandlers {
    onPowerdown(evt: WaterPumpEvent);
    onPowerup(evt: WaterPumpEvent);
    onStateChange(evt: WaterPumpEvent, evtPrev: WaterPumpEvent);
    onMessage(evt: WaterPumpEvent);
}

export function start_mqtt_server(eh: MqttEventHandlers) {
    const client  = mqtt.connect(`mqtt://${mqtt_host}:1883/`)

    client.on('connect', function () {
      console.log(`Connected to mqtt server ${mqtt_host}`)
      client.subscribe('switch/#', function (err) {
        console.log(`Subscribed to switch/# topic`)
        if (!err) {
          client.publish('presence', 'Hello mqtt from robohome')
        }
      })
    })

    let handlers = {}
    let evtlog = null
    let uptimelog = null
    if (output_dir) {
        evtlog = fs.createWriteStream(path.join(output_dir, 'evtlog.jsonl'), {flags: 'a'})
        uptimelog = fs.createWriteStream(path.join('uptime.jsonl'), {flags: 'a'})
    }

    client.on('message', function (topic, message) {
      const ma = topic.match(/^switch[\/](NODE-[^\/]{6})[\/]status/)
      const msg = message.toString().match(/^uptime=(\d+) rssi=([-\d]+) ch0=(\d+)/)
      if (ma && msg) {
          const payload = {
              ts: new Date(),
              node: ma[1],
              uptime: msg[1],
              rssi: msg[2],
              ch0: msg[3],
          }
          eh.onMessage(payload)
          //console.log(`${topic} ${message}`)
          if (evtlog) {
              evtlog.write(JSON.stringify(payload)+'\n')
          }
        
          handlers[payload.node] = handlers[payload.node] || {}

          if (handlers[payload.node].tmr) {
              if (payload.ch0 !== handlers[payload.node]?.lastPayload?.ch0) {
                  eh.onStateChange(payload, handlers[payload.node]?.lastPayload)
              }
              clearTimeout(handlers[payload.node].tmr)
              handlers[payload.node].tmr = null
          } else {
              // this event is usually 10+ seconds late
              // that's time to boot, join wifi and send the first mqtt message
              eh.onPowerup(payload)
          }

          handlers[payload.node].lastPayload = payload;
          handlers[payload.node].tmr = setTimeout(()=>{
              //console.log(`Got event: `, JSON.stringify(payload))
              if (uptimelog) {
                  uptimelog.write(JSON.stringify(payload)+'\n')
              }
              eh.onPowerdown(payload)
          }, lastwill_timeout)

      }
    })
    return client;
}

