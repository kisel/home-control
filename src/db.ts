const { Sequelize, Model, DataTypes } = require('sequelize');
export const sequelize = new Sequelize(process.env.DATABASE_URL)

// {"ts":"2021-07-26T15:49:42.105Z","node":"NODE-06C01A","uptime":"17","rssi":"-63","ch0":"0"}
//
export class WaterPumpJournal extends Model {}
WaterPumpJournal.init({
  ts: DataTypes.DATE,
  node: DataTypes.STRING,
  uptime: DataTypes.INTEGER,
  rssi: DataTypes.INTEGER,
  ch0: DataTypes.BOOLEAN,
}, { sequelize, modelName: 'waterpump_journal' });

