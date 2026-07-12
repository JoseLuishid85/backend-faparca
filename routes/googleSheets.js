const express = require('express');
const router = express.Router();
const { agregarRegistro } = require('../services/googleSheetsService'); // Ajusta la ruta a tu archivo

// Ruta de prueba: POST /faparca/api/windmill/sheet-test
router.post('/sheet-test', async (req, res) => {
    const { id, nombre } = req.body;

    if (!id || !nombre) {
        return res.status(400).json({ error: 'ID y Nombre son requeridos' });
    }

    try {
        const resultado = await agregarRegistro(id, nombre);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).json({ error: 'No se pudo guardar en la hoja de cálculo' });
    }
});

module.exports = router;