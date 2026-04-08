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
    const { gridName, areaName, latitude, longitude, qrCode } = req.body;
      if (!gridName || !areaName || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'gridName, areaName, latitude and longitude are required' });
  }
    const plant = await prisma.plant.create({
      data: {
        gridName: gridName,
        areaName: areaName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        qrCode: qrCode ?? null,
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
    await prisma.reading.deleteMany({
      where: { plantId: id },
    });
    await prisma.plant.delete({
      where: { id },
    });
    res.json({ message: 'Plant deleted' });
  } catch (error) {
    console.error('❌ deletePlant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePlantLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    const plant = await prisma.plant.update({
      where: { id },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    res.json(plant);
  } catch (error) {
    console.error('❌ updatePlantLocation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPlantsWithReadings = async (req, res) => {
  try {
    const plants = await prisma.plant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        readings: {
          orderBy: { recordedAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant, updatePlantLocation, getAllPlantsWithReadings };