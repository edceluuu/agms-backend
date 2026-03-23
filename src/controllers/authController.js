const bcrypt = require('bcryptjs')
const prisma = require('../utils/prisma')
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt')

const login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message })
  }
}

const refresh = async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken)
    return res.status(400).json({ message: 'Missing token' })

  try {
    const payload = verifyRefreshToken(refreshToken)
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })
    if (!stored || stored.expiresAt < new Date())
      return res.status(401).json({ message: 'Refresh token expired or invalid' })

    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (e) {
  console.error('LOGIN ERROR:', e)
  res.status(500).json({ message: 'Server error', error: e.message })
}
}

const logout = async (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  }
  res.json({ message: 'Logged out' })
}

const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
    },
  })
  res.json(user)
}

module.exports = { login, refresh, logout, me }