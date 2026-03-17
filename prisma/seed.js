const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hash('Admin@1234'), name: 'Administrator', role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { username: 'supervisor1' },
    update: {},
    create: { username: 'supervisor1', password: hash('Supervisor@1234'), name: 'Supervisor One', role: 'SUPERVISOR' },
  });

  await prisma.user.upsert({
    where: { username: 'monitor1' },
    update: {},
    create: { username: 'monitor1', password: hash('Monitor@1234'), name: 'Monitor One', role: 'FIELD_MONITOR' },
  });

  console.log('Seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());