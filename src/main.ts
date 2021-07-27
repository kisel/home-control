import {start_mqtt_server} from './mqtt'
import {readEventFile} from './fileimport'
import {WaterPumpJournal, start_db} from './db'
import {start_http_server} from './http'
import {WaterPumpEvent} from './models'
import {import_file, mqtt_host, port, getDatabaseUrl} from './config'
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

    let onPumpPowerdown = (evt: WaterPumpEvent) => {
        console.log(`Pump ${evt.node} off`)
        theStatus.lastChangeMsg = evt;
        theStatus.pumpStatus = "off"
        print_event(evt)
        if (db != null) {
            write_db_event_to_db(evt)
        }
    }

    let onPumpPowerup = (evt: WaterPumpEvent) => {
        console.log(`Pump ${evt.node} on`)
        theStatus.lastChangeMsg = evt;
        theStatus.pumpStatus = "on"
        print_event(evt)
    }

    if (import_file) {
        readEventFile(import_file, onPumpPowerdown)
    }

    if (mqtt_host) {
        const mqtt_client = start_mqtt_server(onPumpPowerdown, onPumpPowerup)
        if (port) {
            start_http_server(mqtt_client, theStatus)
        }
    }
})();

