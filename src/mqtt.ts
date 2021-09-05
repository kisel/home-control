import * as mqtt from 'mqtt'
import * as fs from 'fs'
import * as path from 'path'
import {nodeid, mqtt_host, lastwill_timeout, output_dir} from "./config"
import {WaterPumpEvent} from './models'
import {mqtt_output_host, mqtt_output_topic} from './config'

export interface MqttEventHandlers {
    onPowerdown(evt: WaterPumpEvent);
    onPowerup(evt: WaterPumpEvent);
    onStateChange(evt: WaterPumpEvent, evtPrev: WaterPumpEvent);
    onMessage(evt: WaterPumpEvent);
}

export function start_mqtt_server(eh: MqttEventHandlers) {
    const client  = mqtt.connect(`mqtt://${mqtt_host}:1883/`)
    let ctx = {
        mqtt_output_client: null,
        msg_mirror: (evt: WaterPumpEvent) => {},
    }

    if (mqtt_output_host && mqtt_output_topic) {
        ctx.mqtt_output_client = mqtt.connect(`mqtt://${mqtt_output_host}:1883/`);
        ctx.mqtt_output_client.on('connect', () => {
            console.log(`Connected to output mqtt://${mqtt_output_host}:1883/${mqtt_output_topic}`)
            ctx.mqtt_output_client.publish(
                `${mqtt_output_topic}/presence`, JSON.stringify({"controlled-node": nodeid})
            )

            ctx.msg_mirror = (evt) => {
                ctx.mqtt_output_client.publish(
                    `${mqtt_output_topic}/msg`, JSON.stringify(evt)
                )
            }
        })
    }

    client.on('connect', () => {
      console.log(`Connected to mqtt server ${mqtt_host}`)
      const topic = `switch/${nodeid}/status`
      client.subscribe(topic, (err) => {
        console.log(`Subscribed to ${topic} topic`)
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
              uptime: parseFloat(msg[1]),
              rssi: parseFloat(msg[2]) || 0,
              ch0: msg[3],
          }
          ctx.msg_mirror(payload)
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

