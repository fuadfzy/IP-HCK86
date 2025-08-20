'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // An order item belongs to an order
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
      // An order item belongs to a menu item
      OrderItem.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id' });
    }
  }
  OrderItem.init({
    order_id: DataTypes.INTEGER,
    menu_item_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    total_price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};