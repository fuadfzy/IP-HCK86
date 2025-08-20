"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tablesPath = path.resolve(__dirname, "../tables.json");
    const tables = JSON.parse(fs.readFileSync(tablesPath, "utf-8"));
    tables.forEach(item => {
      item.createdAt = new Date();
      item.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Tables", tables, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Tables", null, {});
  }
};
