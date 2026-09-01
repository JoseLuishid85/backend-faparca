const express = require('express');
const { getProductCategories } = require('../controllers/productCategoryControllers.js');

const routes = express.Router();

routes.get('/', getProductCategories);

module.exports = routes;
