'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A menu item can have many order items
      MenuItem.hasMany(models.OrderItem, { foreignKey: 'menu_item_id' });
    }
  }
  MenuItem.init({
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    image_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MenuItem',
  });
  return MenuItem;
};