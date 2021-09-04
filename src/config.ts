
export const port = process.env.PORT || 8080
export const nodeid = process.env.NODEID
export const ctrltopic = `switch/${nodeid}/ctrl`
export const mqtt_host = process.env.MQTT_HOST
// replay recorded JSONL file
export const import_file = process.env.IMPORT_FILE
// output to file/stream
export const output_dir = process.env.OUTPUT
// print all messages
export const verbose = process.env.VERBOSE
// consider pump down if not seen for 5 seconds
export const lastwill_timeout = 5000
// parse dumb device format, convert to JSON, add datetime and extra fields
// and push back to MQTT for stream recorders such fluentbit-mqtt
// channel name
export const mqtt_output_topic = process.env.MQTT_OUTPUT_TOPIC
export const mqtt_output_host = process.env.MQTT_OUTPUT_HOST

function verifyConfig() {
    if (!nodeid) {
        console.log('NODEID env var is not set!')
        process.exit(1)
    }
}
verifyConfig()

export function getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL
    }
    const {PGUSER, PGPASSWORD, PGHOST, DBNAME} = process.env;
    if (PGUSER && PGPASSWORD && PGHOST && DBNAME) {
        return `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:5432/${DBNAME}`
    }
    return null;
}

// strip pass, make printable
export function toPrintableURL(urlstr: string): string {
    try {
        let url = new URL(urlstr)
        url.password=''
        return url.toString()
    } catch(e) {
        return `invalid url: ${e}`
    }
}

