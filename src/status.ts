import {WaterPumpEvent} from './models'

export class Status {
    lastChangeMsg?: WaterPumpEvent  = null;
    lastStatusMessage?: WaterPumpEvent  = null;
    pumpStatus: null | "on" | "off" = null;
};

export const theStatus = new Status();

