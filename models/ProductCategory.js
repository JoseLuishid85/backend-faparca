const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProductCategory extends Model { }

ProductCategory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Slug interno estable (usado antes como valor de ENUM: soft_wheat, durum_wheat, flour, bran, other)
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    // Color de acento para la UI (variable CSS o valor hex)
    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'product_category',
    timestamps: true,
});

module.exports = ProductCategory;
