const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const ProductCategory = require('./ProductCategory');
const ProductUnit = require('./ProductUnit');

class Product extends Model { }

Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    // Línea del molino a la que pertenece el producto
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: ProductCategory,
            key: 'id'
        }
    },
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: ProductUnit,
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    min_stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    // Ruta relativa de la imagen almacenada en /uploads/products
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'product',
    timestamps: true,
});

Product.belongsTo(ProductCategory, { foreignKey: 'category_id', as: 'category' });
ProductCategory.hasMany(Product, { foreignKey: 'category_id' });

Product.belongsTo(ProductUnit, { foreignKey: 'unit_id', as: 'unit' });
ProductUnit.hasMany(Product, { foreignKey: 'unit_id' });

module.exports = Product;
