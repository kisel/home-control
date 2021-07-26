const express = require('express')
import path = require('path')
import {ctrltopic, port} from './config'

export function start_http_server(client, onEvent) {
    const app = express()

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
    })

    app.listen(port, () => {
      console.log(`app listening at http://localhost:${port}`)
    })
}
