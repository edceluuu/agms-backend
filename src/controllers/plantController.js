const prisma = require('../utils/prisma')

const getPlants = async (req, res) => {
  try {
    const plants = await prisma.plant.findMany({
      where: { isActive: true },
      include: { grid: true },
    })
    res.json(plants)
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

const getPlantByQR = async (req, res) => {
  const { code } = req.params
  try {
    const plant = await prisma.plant.findUnique({
      where: { qrCode: code },
      include: { grid: true },
    })
    if (!plant) return res.status(404).json({ message: 'Plant not found' })
    if (!plant.isActive) return res.status(410).json({ message: 'Plant is inactive' })
    res.json(plant)
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

const createPlant = async (req, res) => {
  const { qrCode, species, gridId, latitude, longitude, plantedAt } = req.body
  try {
    const plant = await prisma.plant.create({
      data: {
        qrCode,
        species,
        gridId: gridId || null,
        latitude: latitude || null,
        longitude: longitude || null,
        plantedAt: plantedAt ? new Date(plantedAt) : null,
      },
      include: { grid: true },
    })
    res.status(201).json(plant)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'QR code already exists' })
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

module.exports = { getPlants, getPlantByQR, createPlant }