const express = require('express');
const {
    createWindmill,
    getWindmill,
    getWindmillById,
    updateWindmill,
    deleteWindmill
} = require('../controllers/windmillControllers.js');

const routes = express.Router();

routes.post('/', createWindmill);
routes.get('/', getWindmill);
routes.get('/:id', getWindmillById);
routes.put('/:id', updateWindmill);
routes.delete('/:id', deleteWindmill);

module.exports = routes;