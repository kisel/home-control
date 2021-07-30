import fs = require('fs');
import readline = require('readline');
import {WaterPumpEvent} from './models'

// allows to replay JSONL files. quite limited compared to mqtt impl
// {"ts":"2021-07-26T15:49:42.105Z","node":"NODE-06C01A","uptime":"17","rssi":"-63","ch0":"0"}
export function readEventFile(fn: string, onEvent: any) {
    const rl = readline.createInterface({
        input: fs.createReadStream(fn)
    });

    let lastEvt: WaterPumpEvent = null;
    rl.on('line', (line) => {
        try {
            if (line) {
                let evt = JSON.parse(line);
                console.log(`read: ${evt}`)
                evt.uptime = (+evt.uptime);

                if (lastEvt != null && lastEvt.uptime > evt.uptime) {
                    // detected new power cycle
                    onEvent(lastEvt)
                }
                lastEvt = evt;
            }
        } catch (e) {
            console.log(e)
        }
    });
}

