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
    console.error('❌ createReading error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ISO week number helper
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// POST /api/readings
const createReading = async (req, res) => {
  try {
    const { plantId, height, girth } = req.body;
    const recordedBy = req.user.id; // comes from JWT middleware

    console.log('📥 createReading body:', { plantId, height, girth, recordedBy });

    if (!plantId || !height || !girth) {
      return res.status(400).json({ message: 'plantId, height and girth are required' });
    }

    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();

    // Verify plant exists before creating reading
    const plant = await prisma.plant.findUnique({ where: { id: plantId } });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found — may have been deleted' });
    }

    const reading = await prisma.reading.create({
      data: {
        plantId,
        height: parseFloat(height),
        girth: parseFloat(girth),
        recordedBy,
        weekNumber,
        year,
      },
    });

    res.status(201).json(reading);
  } catch (error) {
    console.error('❌ createReading error:', error);
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
      include: {
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 1, // only the latest reading per plant
        },
      },
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;

    const plant = await prisma.plant.findUnique({ where: { id } });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    await prisma.reading.deleteMany({ where: { plantId: id } });
    await prisma.plant.delete({ where: { id } });

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

const getReadingsByPlantId = async (req, res) => {
  try {
    const { plantId } = req.params;
    const readings = await prisma.reading.findMany({
      where: { plantId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant, updatePlantLocation, getAllPlantsWithReadings, getReadingsByPlantId, };