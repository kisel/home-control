import {start_mqtt_server} from './mqtt'
import {readEventFile} from './fileimport'
import {sequelize, WaterPumpJournal} from './db'
import {start_http_server} from './http'
import {import_file, mqtt_host, port} from './config'

function write_db_event(evt: any) {
  WaterPumpJournal.create(evt).catch(e => {
      console.log(e)
  });
}

(async () => {
  await sequelize.sync();
   if (import_file) {
       readEventFile(import_file, write_db_event)
   }
    if (mqtt_host) {
        const mqtt_client = start_mqtt_server(write_db_event)
        if (port) {
            start_http_server(mqtt_client, write_db_event)
        }
    }
})();

