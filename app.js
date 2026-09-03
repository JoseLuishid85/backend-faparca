const express = require('express');
const cors = require('cors');
const path = require('path');
//require('dotenv').config({ quiet: true });
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Archivos estáticos (imágenes de productos, etc.)
// Se sirven tanto en /uploads (dev) como en /faparca/uploads, ya que en
// producción la app se monta bajo el prefijo /faparca sin que nada lo recorte.
// producción la app se monta bajo el prefijo /faparca sin que nada lo recorte.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/faparca/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Sync
sequelize.sync({ alter: false })
    .then(() => console.log('Database connected and synchronized.'))
    .catch(err => console.error('Error synchronizing DB:', err));

// Routes
app.use('/faparca/api/windmill', require('./routes/windmillRouter'));
app.use('/faparca/api/product', require('./routes/productRouter'));
app.use('/faparca/api/product-category', require('./routes/productCategoryRouter'));
app.use('/faparca/api/product-unit', require('./routes/productUnitRouter'));
app.use('/faparca/api/google', require('./routes/googleSheets'));

const PORT = process.env.PORT || 4000; 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});