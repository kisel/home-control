import {start_mqtt_server, MqttEventHandlers} from './mqtt'
import {readEventFile} from './fileimport'
import {WaterPumpJournal, WaterPumpLog, start_db} from './db'
import {Sequelize} from 'sequelize'
import {start_http_server} from './http'
import {WaterPumpEvent} from './models'
import {import_file, mqtt_host, port, getDatabaseUrl, verbose, lastwill_timeout} from './config'
import {theStatus} from './status'
import { Op } from 'sequelize'

function print_event(evt: WaterPumpEvent) {
  console.log(evt)
}

function write_db_event_to_db(sequelize: Sequelize, evt: WaterPumpEvent) {
    let uptime_ms = (+evt.uptime || 0) * 1000
    if (uptime_ms > 24 * 3600 * 1000 ) {
        // just in case we ever get corrupted uptime - don't kill the whole log
        uptime_ms = 0;
    }
    sequelize.transaction(async (t) => {
        await WaterPumpJournal.destroy({
            where: {
                node: evt.node,
                ts: {
                    [Op.and]: {
                        [Op.gte]: new Date(evt.ts.getTime() - uptime_ms - (lastwill_timeout / 2)),
                        [Op.lte]: new Date(evt.ts.getTime() + (lastwill_timeout / 2))
                    }
                }
            },
            transaction: t
        })
        await WaterPumpJournal.create(evt, {transaction: t})
    }).catch(e => { console.log('failed to write to db', e) });
}

(async () => {
    const sequelize = (getDatabaseUrl()) ? (await start_db()) : null;

    const eh: MqttEventHandlers = {
        onStateChange: (evt, evtPrev) => {
            console.log(`Pump state changed to `, evt, ` from `, evtPrev)
            WaterPumpLog.create({...evtPrev, reason: 'change', source: 'from'})
            WaterPumpLog.create({...evt, reason: 'change', source: 'to'})
        },

        onPowerdown: (evt) => {
            // moment when we lost connection to pump
            console.log(`Pump ${evt.node} off`)
            theStatus.lastChangeMsg = evt;
            theStatus.pumpStatus = "off"
            print_event(evt)
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
            if (sequelize != null) {
                write_db_event_to_db(sequelize, evt)
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

