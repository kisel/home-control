 

const mqtt = require('mqtt')
//const client  = mqtt.connect('mqtt://192.168.3.100:1883/#')
const client  = mqtt.connect('mqtt://mqtt:1883/#')
const fs = require('fs')
const path = require('path')

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
      }, timeout)

  }
  // message is Buffer
  console.log(message.toString())
  //client.end()
})

const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const nodeid = process.env.NODEID || 'NODE-D5C683'
const ctrltopic = `switch/${nodeid}/ctrl`

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../public') });
})

app.get('/api/water/reset', (req, res) => {
  client.publish(ctrltopic, 'ch0=0')
  res.send('Water reset called')
})

app.get('/api/water/kill', (req, res) => {
  client.publish(ctrltopic, 'ch0=1')
  res.send('Water pump is blocked!')
  res.redirect
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})

