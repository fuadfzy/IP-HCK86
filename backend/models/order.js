'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // An order belongs to a session
      Order.belongsTo(models.Session, { foreignKey: 'session_id' });
      // An order belongs to a user
      Order.belongsTo(models.User, { foreignKey: 'user_id' });
      // An order has many order items
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
    }
  }
  Order.init({
    session_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    total: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};