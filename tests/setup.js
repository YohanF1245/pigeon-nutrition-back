const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Connexion à la base de données de test
  process.env.DATABASE_URL = 'postgresql://pigeon_user:pigeon_password@localhost:5432/pigeon_nutrition_test';
  await prisma.$connect();
});

beforeEach(async () => {
  // Nettoyer la base de données avant chaque test
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
});

afterAll(async () => {
  // Déconnexion de la base de données
  await prisma.$disconnect();
}); 