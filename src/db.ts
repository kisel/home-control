const { Sequelize, Model, DataTypes } = require('sequelize');
import {getDatabaseUrl} from './config'

// table with pump-id, endtime, work duration
// reflects when pump was powered-down and the last seen state
export class WaterPumpJournal extends Model {}

// Extended version of WaterPumpJournal (TODO: combine tables?)
export class WaterPumpLog extends Model {}

const evtStruct = {
    ts: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: true
    },
    node: { type: DataTypes.STRING, allowNull: false, },
    uptime: { type: DataTypes.INTEGER, allowNull: false, },
    rssi: { type: DataTypes.INTEGER, allowNull: false, },
    ch0: { type: DataTypes.STRING, allowNull: false, },
    record_type: { type: DataTypes.STRING, allowNull: true, },
}

const evtStructLog = {...evtStruct,
    reason: { type: DataTypes.STRING, allowNull: true, },
    source: { type: DataTypes.STRING, allowNull: true, },
    meta: { type: DataTypes.JSON, allowNull: true, },
}

export async function start_db() {
    const sequelize = new Sequelize(getDatabaseUrl())
    WaterPumpJournal.init(evtStruct, { sequelize, modelName: 'waterpump_journal' });
    WaterPumpLog.init(evtStructLog, { sequelize, modelName: 'waterpump_log' });
    await sequelize.sync();
    console.log("Database initialized")
    return sequelize;
}

