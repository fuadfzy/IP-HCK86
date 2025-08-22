'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A table can have many sessions
      Table.hasMany(models.Session, { foreignKey: 'table_id' });
    }
  }
  Table.init({
    qr_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Table',
  });
  return Table;
};