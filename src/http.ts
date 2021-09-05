import express = require('express')
import { MqttClient } from 'mqtt'
import path = require('path')
import { readActionsFile } from './actions'
import {actions_file_path, ctrltopic, port} from './config'
import { apiWrapper } from './http_utils'
import {Status} from './status'

export function start_http_server(client: MqttClient, currentStatus: Status) {
    const app = express()

    const publicDir = path.join(__dirname, '../public');
    app.use(express.static(publicDir));

    app.get('/healthz', apiWrapper(async (_req) => {
      return {ok: true};
    }))

    app.get('/api/actions', apiWrapper(async (_req) => {
      const actions_file = await readActionsFile(actions_file_path);
      return actions_file;
    }))

    app.post('/api/actions/:action_id', apiWrapper(async (req) => {
      const {action_id} = req.params;
      const {actions} = await readActionsFile(actions_file_path);
      const actionDef = actions.find((a) => a.id == action_id);
      for (let cmd of actionDef.commands) {
        client.publish(cmd.topic, cmd.payload)
      }
    }))

    app.get('/api/status', apiWrapper(async (_req) => {
      return ({pumpStatus: currentStatus.pumpStatus, lastMsg: currentStatus.lastStatusMessage})
    }))

    app.listen(port, () => {
      console.log(`app listening at http://localhost:${port}`)
    })
}
