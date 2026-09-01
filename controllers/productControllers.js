const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const ProductUnit = require('../models/ProductUnit');
const { syncProductCreate, syncProductUpdate, syncProductDelete } = require('../services/googleSheetsService');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');

const INCLUDE = [
    { model: ProductCategory, as: 'category' },
    { model: ProductUnit, as: 'unit' },
];

// La sincronización con Google Sheets es un side-effect best-effort:
// si falla, no debe tumbar la respuesta principal del CRUD.
async function syncSheetSafe(fn, ...args) {
    try {
        await fn(...args);
    } catch (error) {
        console.error('Error al sincronizar con Google Sheets:', error.message || error);
    }
}

function removeImageFile(imagePath) {
    if (!imagePath) return;
    const fullPath = path.join(__dirname, '..', imagePath);
    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error al eliminar imagen:', err);
        }
    });
}

// Convierte los campos numéricos que llegan como string (multipart/form-data)
function parseProductInput(data) {
    const out = { ...data };
    if ('category_id' in out) out.category_id = out.category_id ? parseInt(out.category_id, 10) : null;
    if ('unit_id' in out) out.unit_id = out.unit_id ? parseInt(out.unit_id, 10) : null;
    if ('stock' in out) out.stock = out.stock === '' || out.stock == null ? 0 : parseFloat(out.stock);
    if ('min_stock' in out) out.min_stock = out.min_stock === '' || out.min_stock == null ? null : parseFloat(out.min_stock);
    if ('price' in out) out.price = out.price === '' || out.price == null ? null : parseFloat(out.price);
    delete out.remove_image;
    return out;
}

const createProduct = async (req, res) => {
    const data = parseProductInput(req.body);

    try {
        await Product.sync();

        if (data.code) {
            const codeExists = await Product.findOne({ where: { code: data.code } });
            if (codeExists) {
                if (req.file) removeImageFile(`uploads/products/${req.file.filename}`);
                return res.status(400).json({
                    msg: `Ya existe un producto registrado con el código ${data.code}`
                });
            }
        }

        const newProduct = await Product.create({
            ...data,
            image: req.file ? `uploads/products/${req.file.filename}` : null,
        });

        const created = await Product.findByPk(newProduct.id, { include: INCLUDE });

        await syncSheetSafe(syncProductCreate, created);

        res.status(201).json({
            msg: 'Producto creado con éxito',
            product: created
        });

    } catch (error) {
        console.error('Error en createProduct:', error);
        if (req.file) removeImageFile(`uploads/products/${req.file.filename}`);
        res.status(500).json({
            ok: false,
            message: 'Error al procesar los datos del producto'
        });
    }
}

const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: INCLUDE,
            order: [['name', 'ASC']]
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al obtener los productos'
        });
    }
}

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, { include: INCLUDE });

        if (!product) {
            return res.status(404).json({
                ok: false,
                msg: 'Producto no encontrado'
            });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error en getProductById:', error);
        res.status(500).json({
            ok: false,
            message: 'Error al procesar los datos del producto'
        });
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const data = parseProductInput(req.body);

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            if (req.file) removeImageFile(`uploads/products/${req.file.filename}`);
            return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        }

        if (data.code) {
            const codeExists = await Product.findOne({ where: { code: data.code } });
            if (codeExists && codeExists.id !== product.id) {
                if (req.file) removeImageFile(`uploads/products/${req.file.filename}`);
                return res.status(400).json({
                    msg: `Ya existe un producto registrado con el código ${data.code}`
                });
            }
        }

        const previousImage = product.image;
        const updateData = { ...data };

        if (req.file) {
            updateData.image = `uploads/products/${req.file.filename}`;
        } else if (req.body.remove_image === 'true' || req.body.remove_image === true) {
            updateData.image = null;
        }

        await product.update(updateData);

        if ((req.file || updateData.image === null) && previousImage) {
            removeImageFile(previousImage);
        }

        const updated = await Product.findByPk(id, { include: INCLUDE });

        await syncSheetSafe(syncProductUpdate, updated);

        res.status(200).json({
            msg: 'Producto actualizado con éxito',
            product: updated
        });
    } catch (error) {
        console.error('Error en updateProduct:', error);
        if (req.file) removeImageFile(`uploads/products/${req.file.filename}`);
        res.status(500).json({ ok: false, message: 'Error al actualizar el producto' });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                ok: false,
                msg: 'Producto no encontrado'
            });
        }

        const productId = product.id;

        await product.destroy();
        removeImageFile(product.image);

        await syncSheetSafe(syncProductDelete, productId);

        res.status(200).json({
            ok: true,
            msg: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        res.status(500).json({ ok: false, message: 'Error al eliminar el producto' });
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    UPLOADS_DIR
};
