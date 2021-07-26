const fs = require('fs');
const readline = require('readline');

// {"ts":"2021-07-26T15:49:42.105Z","node":"NODE-06C01A","uptime":"17","rssi":"-63","ch0":"0"}
export function readEventFile(fn: string, onEvent: any) {
    const rl = readline.createInterface({
        input: fs.createReadStream(fn)
    });

    rl.on('line', (line) => {
        try {
            if (line) {
                let evt = JSON.parse(line);
                evt.ts = new Date(evt.ts)
                onEvent(evt)
            }
        } catch (e) {
            console.log(e)
        }
    });
}

