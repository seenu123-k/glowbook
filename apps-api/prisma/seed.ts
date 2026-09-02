import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'glowbook',
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = 'admin@glowbook.com';
  const password = 'Admin@12345';

  const passwordHash = await bcrypt.hash(
    password,
    12,
  );

  const admin = await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      name: 'GlowBook Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },

    create: {
      name: 'GlowBook Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('');
  console.log('================================');
  console.log('ADMIN CREATED SUCCESSFULLY');
  console.log('================================');
  console.log('ID:', admin.id);
  console.log('Name:', admin.name);
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
  console.log('Status:', admin.status);
  console.log('================================');
}

main()
  .catch((error) => {
    console.error('SEED ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });