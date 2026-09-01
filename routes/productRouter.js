const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    UPLOADS_DIR
} = require('../controllers/productControllers.js');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = allowed.test(file.mimetype);
    if (okExt && okMime) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Envuelve multer para responder JSON en vez del handler de error por defecto de Express
function uploadImage(req, res, next) {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ ok: false, message: err.message });
        }
        next();
    });
}

const routes = express.Router();

routes.post('/', uploadImage, createProduct);
routes.get('/', getProducts);
routes.get('/:id', getProductById);
routes.put('/:id', uploadImage, updateProduct);
routes.delete('/:id', deleteProduct);

module.exports = routes;
