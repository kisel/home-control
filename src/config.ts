
export const port = process.env.PORT || 8080
export const nodeid = process.env.NODEID || 'NODE-D5C683'
export const ctrltopic = `switch/${nodeid}/ctrl`
export const mqtt_host = process.env.MQTT_HOST
// replay recorded JSONL file
export const import_file = process.env.IMPORT_FILE
// output to file/stream
export const output_dir = process.env.OUTPUT
// print all messages
export const verbose = process.env.VERBOSE
export const lastwill_timeout = 5000


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

