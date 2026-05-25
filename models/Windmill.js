const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Windmill extends Model { }

Windmill.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    shift: {
        type: DataTypes.STRING(50),
        allowNull: true 
    },
    operator: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    assistant: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    shift_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Almacena el objeto de lecturas wg completo
    wg_readings: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Almacena el arreglo de silos de trigo blando
    soft_silos: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Almacena el arreglo de silos de trigo durum
    durum_silos: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Almacena el arreglo de silos de harina y salvado
    flour_bran_silos: {
        type: DataTypes.JSON,
        allowNull: true
    },
    soft_flowmeter: {
        type: DataTypes.DECIMAL(10, 2), // O INTEGER dependiendo de la precisión de tu flujómetro
        allowNull: true
    },
    soft_absolute_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    durum_flowmeter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    durum_absolute_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    mixed_additives: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    unmixed_additives: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    magnet_residue_grams: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Windmill',
    tableName: 'windmill', // Nombre de la tabla solicitado
    timestamps: true,      // Añade createdAt y updatedAt automáticamente
});

module.exports = Windmill;