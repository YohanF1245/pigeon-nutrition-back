const mockPrisma = {
  repas: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  compositionRepas: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  produit: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

module.exports = mockPrisma; 