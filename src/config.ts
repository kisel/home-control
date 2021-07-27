
export const port = process.env.PORT || 8080
export const nodeid = process.env.NODEID || 'NODE-D5C683'
export const ctrltopic = `switch/${nodeid}/ctrl`
export const mqtt_host = process.env.MQTT_HOST
export const import_file = process.env.IMPORT_FILE
export const output_dir = process.env.OUTPUT
export const lastwill_timeout = 5000


