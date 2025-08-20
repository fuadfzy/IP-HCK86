'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A session belongs to a table
      Session.belongsTo(models.Table, { foreignKey: 'table_id' });
      // A session belongs to a user
      Session.belongsTo(models.User, { foreignKey: 'user_id' });
      // A session can have many orders
      Session.hasMany(models.Order, { foreignKey: 'session_id' });
    }
  }
  Session.init({
    table_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    started_at: DataTypes.DATE,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};