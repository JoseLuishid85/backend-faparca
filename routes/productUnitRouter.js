const express = require('express');
const { getProductUnits } = require('../controllers/productUnitControllers.js');

const routes = express.Router();

routes.get('/', getProductUnits);

module.exports = routes;
