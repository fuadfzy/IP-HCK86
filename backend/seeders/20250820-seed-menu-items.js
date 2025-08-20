"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const menuItemsPath = path.resolve(__dirname, "../menu-items.json");
    const menuItems = JSON.parse(fs.readFileSync(menuItemsPath, "utf-8"));
    menuItems.forEach(item => {
      item.createdAt = new Date();
      item.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("MenuItems", menuItems, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("MenuItems", null, {});
  }
};
