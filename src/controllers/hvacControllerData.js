const { HVACData } = require("../models");
const { Op } = require('sequelize');

const fetchHVACRealtimeData = async (Model, idField, timeField, req, res, hvacName) => {
    const { startDate, endDate, limit } = req.query;
    const identifierValue = req.params[idField];

    try {
        const whereCondition = {
            [idField]: identifierValue,
        };

        if (startDate && endDate) {
            whereCondition[timeField] = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const options = {
            where: whereCondition,
            order: [[timeField, 'DESC']],
            limit: limit ? parseInt(limit, 10) : undefined,
        };

        const data = await Model.findAll(options);
        return res.json(data);
    } catch (err) {
        console.error(`Failed to fetch ${hvacName} data for ${idField} ${identifierValue}:`, err.message);
        return res.status(500).json({ error: `Failed to retrieve ${hvacName} real-time data` });
    }
};

exports.getMitsubishiElectricHVACRealtimeData = async (req, res) => {
    return fetchHVACRealtimeData(
        HVACData, 
        'hvac_id', 
        'timestamp', 
        req, 
        res, 
        'Mitsubishi Electric HVAC',
    );
};