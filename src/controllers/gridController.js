const prisma = require('../utils/prisma')

const getGrids = async (req, res) => {
  try {
    const grids = await prisma.grid.findMany({
      include: {
        plants: {
          where: { isActive: true },
          select: { id: true, qrCode: true, species: true },
        },
      },
    })
    res.json(grids)
  } catch (e) {
    console.error('getGrids error:', e)
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

const createGrid = async (req, res) => {
  const { name } = req.body
  console.log('createGrid body:', req.body)
  if (!name) return res.status(400).json({ message: 'Grid name is required' })
  try {
    const grid = await prisma.grid.create({
      data: { name },
    })
    res.status(201).json(grid)
  } catch (e) {
    console.error('createGrid error:', e)
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

module.exports = { getGrids, createGrid }