// {"ts":"2021-07-26T15:49:42.105Z","node":"NODE-06C01A","uptime":"17","rssi":"-63","ch0":"0"}

export interface WaterPumpEvent {
    ts: Date
    node: string
    uptime: number
    rssi: number
    ch0: string // "1" | "0"
}
