import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const financeRole = await prisma.role.upsert({
    where: { name: 'FINANCE' },
    update: {},
    create: { name: 'FINANCE' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF' },
  });

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@erp.local' },
    update: {},
    create: {
      email: 'admin@erp.local',
      password: hashedPassword,
      fullName: 'System Administrator',
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  });

  console.log('✅ Seeding complete: roles + admin created.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
