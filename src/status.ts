import {WaterPumpEvent} from './models'

export class Status {
    lastChangeMsg?: WaterPumpEvent;
    pumpStatus: null | "on" | "off" = null;
};

export const theStatus = new Status();

