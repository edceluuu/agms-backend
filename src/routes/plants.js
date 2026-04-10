//backend/src/routes/plants.js
const express = require('express');
const router = express.Router();
const { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant, updatePlantLocation, getAllPlantsWithReadings, getReadingsByPlantId } = require('../controllers/plantController');
const { authenticate } = require('../middleware/auth');

router.get('/grid/:gridName', authenticate, getPlantsByGrid);
router.get('/', authenticate, getAllPlantsWithReadings);
router.get('/readings/:plantId', authenticate, getReadingsByPlantId);
router.post('/readings', authenticate, createReading);
router.post('/', authenticate, createPlant);
router.patch('/:id/location', authenticate, updatePlantLocation);
router.delete('/:id', authenticate, deletePlant);
router.get('/:qrCode', authenticate, getPlantByQrCode);

module.exports = router;