const express = require('express')
import path = require('path')
import {ctrltopic, port} from './config'
import {Status} from './status'

export function start_http_server(client, currentStatus: Status) {
    const app = express()

    app.get('/', (req, res) => {
      console.log('served index.html')
      res.sendFile('index.html', { root: path.join(__dirname, '../public') });
    })

    app.get('/healthz', (req, res) => {
      res.send('ok')
    })

    app.get('/api/water/status', (req, res) => {
      res.json({pumpStatus: currentStatus.pumpStatus, lastMsg: currentStatus.lastChangeMsg})
    })

    app.get('/api/water/reset', (req, res) => {
      client.publish(ctrltopic, 'ch0=0')
      console.log('Water reset called')
      res.send('Water reset called')
    })

    app.get('/api/water/kill', (req, res) => {
      client.publish(ctrltopic, 'ch0=1')
      console.log('Water pump is blocked!')
      res.send('Water pump is blocked!')
    })

    app.listen(port, () => {
      console.log(`app listening at http://localhost:${port}`)
    })
}
