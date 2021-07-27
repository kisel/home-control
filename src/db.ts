const { Sequelize, Model, DataTypes } = require('sequelize');
import {getDatabaseUrl} from './config'
//
export class WaterPumpJournal extends Model {}

export async function start_db() {
    const sequelize = new Sequelize(getDatabaseUrl())
    WaterPumpJournal.init({
        ts: {
            type: DataTypes.DATE,
            allowNull: false,
            unique: true
        },
        node: { type: DataTypes.STRING, allowNull: false, },
        uptime: { type: DataTypes.INTEGER, allowNull: false, },
        rssi: { type: DataTypes.INTEGER, allowNull: false, },
        ch0: { type: DataTypes.STRING, allowNull: false, },
    }, { sequelize, modelName: 'waterpump_journal' });
    await sequelize.sync();
    console.log("Database initialized")
    return sequelize;
}

