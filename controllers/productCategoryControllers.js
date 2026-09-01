const ProductCategory = require('../models/ProductCategory');

const getProductCategories = async (req, res) => {
    try {
        await ProductCategory.sync();
        const categories = await ProductCategory.findAll({
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error en getProductCategories:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener las categorías de producto'
        });
    }
}

module.exports = {
    getProductCategories
};
