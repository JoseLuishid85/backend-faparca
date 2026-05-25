const Windmill = require("../models/Windmill");

const createWindmill = async (req, res) => {
    
    const data = req.body;
    
    try {
        await Windmill.sync();

        if (data.date && data.shift) {
            const reportExists = await Windmill.findOne({ 
                where: { 
                    date: data.date, 
                    shift: data.shift 
                } 
            });

            if (reportExists) {
                return res.status(400).json({ 
                    msg: `Ya existe un reporte registrado para la fecha ${data.date} en el turno ${data.shift}` 
                });
            }
        }

        const newReport = await Windmill.create(data);

        res.status(201).json({
            msg: "Reporte de molino creado con éxito",
            windmill: newReport
        });

    } catch (error) {
        console.error("Error en createWindmill:", error); 
        res.status(500).json({ 
            ok: false, 
            message: 'Error al procesar los datos del reporte' 
        });
    }
}

const getWindmill = async (req, res) => {

    try {
        const reports = await Windmill.findAll({
            order: [['date', 'DESC']]
        });
        
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error en getWindmill:", error);
        res.status(500).json({ 
            ok: false, 
            message: 'Error al obtener los reportes del molino' 
        });
    }
}

const getWindmillById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const report = await Windmill.findByPk(id);
        
        if (!report) {
            return res.status(404).json({ 
                ok: false, 
                msg: 'Reporte de molino no encontrado' 
            });
        }
        
        res.status(200).json(report);
    } catch (error) {
        console.error("Error en getWindmillById:", error);
        res.status(500).json({ 
            ok: false, 
            message: 'Error al procesar los datos del reporte' 
        });
    }
}

const updateWindmill = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    
    try {
        const reportExists = await Windmill.findByPk(id);
        if (!reportExists) {
            return res.status(404).json({ ok: false, msg: 'Reporte de molino no encontrado' });
        }
        
        await Windmill.update(data, { where: { id } });
        
        const updatedReport = await Windmill.findByPk(id);
        
        res.status(200).json({
            msg: "Reporte actualizado con éxito",
            windmill: updatedReport
        });
    } catch (error) {
        console.error("Error en updateWindmill:", error);
        res.status(500).json({ ok: false, message: 'Error al actualizar el reporte' });
    }
}

const deleteWindmill = async (req, res) => {
    const { id } = req.params;
    
    try {
        const deleted = await Windmill.destroy({ where: { id } });
        
        if (deleted) {
            res.status(200).json({ 
                ok: true, 
                msg: 'Reporte de molino eliminado correctamente' 
            });
        } else {
            res.status(404).json({ 
                ok: false, 
                msg: 'Reporte de molino no encontrado' 
            });
        }
    } catch (error) {
        console.error("Error en deleteWindmill:", error);
        res.status(500).json({ ok: false, message: 'Error al eliminar el reporte' });
    }
}

module.exports = {
    createWindmill,
    getWindmill,
    getWindmillById,
    updateWindmill,
    deleteWindmill
};