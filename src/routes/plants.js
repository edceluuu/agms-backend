//backend/src/routes/plants.js
const express = require('express');
const router = express.Router();
const { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant, updatePlantLocation } = require('../controllers/plantController');
const { authenticate } = require('../middleware/auth');

router.get('/grid/:gridName', authenticate, getPlantsByGrid);   // must be before /:qrCode
router.get('/:qrCode', authenticate, getPlantByQrCode);
router.post('/', authenticate, createPlant);
router.post('/readings', authenticate, createReading);
router.patch('/:id/location', authenticate, updatePlantLocation);
router.delete('/:id', authenticate, deletePlant);

module.exports = router;