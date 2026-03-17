const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
  });
  res.json(users);
};

const createUser = async (req, res) => {
  const { username, password, name, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, name, role },
      select: { id: true, username: true, name: true, role: true },
    });
    res.status(201).json(user);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, isActive, password } = req.body;
  const data = { name, role, isActive };
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({ where: { id }, data });
    res.json(user);
  } catch {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { getUsers, createUser, updateUser };