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

// Returns { start: Date (Monday 00:00), end: Date (Sunday 23:59:59) } for a given ISO week
function getWeekDateRange(weekNumber, year) {
  // Find Jan 4th (always in week 1) then backtrack to Monday of week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));

  // Add (weekNumber - 1) weeks to get to the target Monday
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (weekNumber - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
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

    // Fetch the most recent previous reading for this plant
    const previousReading = await prisma.reading.findFirst({
      where: { plantId },
      orderBy: { recordedAt: 'desc' },
    });

    const newHeight = parseFloat(height);
    const newGirth = parseFloat(girth);
    let isFlagged = false;
    let flagReason = null;

    if (previousReading) {
      const reasons = [];

      if (newHeight < previousReading.height) {
        reasons.push('Height decreased from previous reading');
      }
      if (newGirth < previousReading.girth) {
        reasons.push('Girth decreased from previous reading');
      }
      if (newHeight - previousReading.height > 0.5) {
        reasons.push('Height growth exceeds 0.5m in one week');
      }
      if (newGirth - previousReading.girth > 0.1) {
        reasons.push('Girth growth exceeds 0.1m in one week');
      }

      if (reasons.length > 0) {
        isFlagged = true;
        flagReason = reasons.join('; ');
      }
    }

    const reading = await prisma.reading.create({
      data: {
        plantId,
        height: newHeight,
        girth: newGirth,
        recordedBy,
        weekNumber,
        year,
        isFlagged,
        flagReason,
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
  where: { gridName },
  include: {
    readings: {
      orderBy: { recordedAt: 'desc' },
      take: 1,
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
    const { week, year } = req.query;

    // Build the readings filter — if week+year provided, restrict to that week's date range
    let readingsFilter = {};
    if (week && year) {
      const { start, end } = getWeekDateRange(parseInt(week), parseInt(year));
      readingsFilter = {
        where: {
          recordedAt: { gte: start, lte: end },
        },
      };
    }

    const allPlants = await prisma.plant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        readings: {
          ...readingsFilter,
          orderBy: { recordedAt: 'desc' },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    // If filtering by week, only return plants that have at least one reading that week
    const plants = (week && year)
      ? allPlants.filter(p => p.readings.length > 0)
      : allPlants;

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

const deactivatePlant = async (req, res) => {
  try {
    const { id } = req.params;

    const plant = await prisma.plant.findUnique({ where: { id } });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const updated = await prisma.plant.update({
      where: { id },
      data: { isActive: false },
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ deactivatePlant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPlantByQrCode, createReading, createPlant, getPlantsByGrid, deletePlant, updatePlantLocation, getAllPlantsWithReadings, getReadingsByPlantId, deactivatePlant };