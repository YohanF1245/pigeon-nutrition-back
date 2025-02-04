// Configuration de Jest pour les tests mockés
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => require('./mocks/prisma.mock'))
  };
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
}); 