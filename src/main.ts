import {start_mqtt_server, MqttEventHandlers} from './mqtt'
import {readEventFile} from './fileimport'
import {WaterPumpJournal, start_db} from './db'
import {start_http_server} from './http'
import {WaterPumpEvent} from './models'
import {import_file, mqtt_host, port, getDatabaseUrl, verbose} from './config'
import {theStatus} from './status'

function print_event(evt: WaterPumpEvent) {
  console.log(evt)
}

function write_db_event_to_db(evt: WaterPumpEvent) {
  WaterPumpJournal.create(evt).catch(e => {
      console.log('failed to write to db', e)
  });
}

(async () => {
    const db = (getDatabaseUrl()) ? (await start_db()) : null;

    const eh: MqttEventHandlers = {
        onStateChange: (evt, evtPrev) => {
            console.log(`Pump state changed to `, evt, ` from `, evtPrev)
            WaterPumpJournal.create({...evtPrev, reason: 'change', source: 'from'})
            WaterPumpJournal.create({...evt, reason: 'change', source: 'to'})
        },

        onPowerdown: (evt) => {
            // moment when we lost connection to pump
            console.log(`Pump ${evt.node} off`)
            theStatus.lastChangeMsg = evt;
            theStatus.pumpStatus = "off"
            print_event(evt)
            if (db != null) {
                write_db_event_to_db(evt)
            }
        },

        onPowerup: (evt) => {
            // moment when we got a 1st report from pump(
            // ~7-12sec after start with precise uptime)
            // event will be recorded
            console.log(`Pump ${evt.node} on`)
            theStatus.lastChangeMsg = evt;
            theStatus.pumpStatus = "on"
            print_event(evt)
        },

        onMessage: (evt) => {
            if (verbose) {
                console.log(`received: ${JSON.stringify(evt)}`)
            }
        },
    }


    if (import_file) {
        readEventFile(import_file, eh.onPowerdown)
    }

    if (mqtt_host) {
        const mqtt_client = start_mqtt_server(eh)
        if (port) {
            start_http_server(mqtt_client, theStatus)
        }
    }
})();

