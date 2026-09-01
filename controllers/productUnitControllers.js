const ProductUnit = require('../models/ProductUnit');

const getProductUnits = async (req, res) => {
    try {
        await ProductUnit.sync();
        const units = await ProductUnit.findAll({
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        res.status(200).json(units);
    } catch (error) {
        console.error('Error en getProductUnits:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener las unidades de producto'
        });
    }
}

module.exports = {
    getProductUnits
};
