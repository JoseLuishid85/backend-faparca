const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProductUnit extends Model { }

ProductUnit.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Abreviatura mostrada junto a las cantidades (ton, kg, saco...)
    abbreviation: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'ProductUnit',
    tableName: 'product_unit',
    timestamps: true,
});

module.exports = ProductUnit;
