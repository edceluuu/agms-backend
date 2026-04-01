//backend/src/controllers/plantController.js
const prisma = require('../utils/prisma');

// GET /api/plants/:qrCode
const getPlantByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const plant = await prisma.plant.findUnique({
      where: { qrCode },
    });

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (!plant.isActive) {
      return res.status(400).json({ message: 'Plant is inactive' });
    }

    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/readings
const createReading = async (req, res) => {
  try {
    const { plantId, height, girth } = req.body;
    const recordedBy = req.user.id; // comes from JWT middleware

    if (!plantId || !height || !girth) {
      return res.status(400).json({ message: 'plantId, height and girth are required' });
    }

    const reading = await prisma.reading.create({
      data: {
        plantId,
        height: parseFloat(height),
        girth: parseFloat(girth),
        recordedBy,
      },
    });

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPlant = async (req, res) => {
  try {
    const { qrCode, gridName, areaName, latitude, longitude } = req.body;
    if (!qrCode || !gridName || !areaName || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'qrCode, gridName, areaName, latitude, longitude are required' });
    }
    const existing = await prisma.plant.findUnique({ where: { qrCode } });
    if (existing) {
      return res.status(409).json({ message: 'A plant with this QR code already exists' });
    }
    const plant = await prisma.plant.create({
      data: {
        qrCode,
        gridName,
        areaName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });
    res.status(201).json(plant);
  } catch (error) {
    console.error('❌ createPlant error:', error); // add this
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPlantsByGrid = async (req, res) => {
  try {
    const { gridName } = req.params;
    const plants = await prisma.plant.findMany({
      where: { gridName, isActive: true },
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.plant.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: 'Plant deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant };