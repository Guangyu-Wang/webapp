const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define("product", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        sku: {
            type: Sequelize.STRING,
        },
        manufacturer: {
            type: Sequelize.STRING,
        },
        quantity: {
            type: Sequelize.INTEGER,
        },
        owner_user_id: {
            type: Sequelize.INTEGER,
        }
    });

    return Product;
}