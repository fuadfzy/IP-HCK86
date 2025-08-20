'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A user can have many sessions
      User.hasMany(models.Session, { foreignKey: 'user_id' });
      // A user can have many orders
      User.hasMany(models.Order, { foreignKey: 'user_id' });
    }
  }
  User.init({
    google_id: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};