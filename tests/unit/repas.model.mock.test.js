const mockPrisma = require('../mocks/prisma.mock');
const RepasModel = require('../../src/models/repas.model');

describe('RepasModel - Create', () => {
  const mockRepasData = {
    nom: 'Petit déjeuner',
    date: new Date('2024-01-28'),
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123'
  };

  const mockCreatedRepas = {
    id: 'repas-123',
    ...mockRepasData,
    compositions: []
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('creer', () => {
    it('devrait créer un nouveau repas avec succès', async () => {
      mockPrisma.repas.create.mockResolvedValue(mockCreatedRepas);

      const repas = await RepasModel.creer(mockRepasData);

      expect(mockPrisma.repas.create).toHaveBeenCalledWith({
        data: {
          nom: mockRepasData.nom,
          date: mockRepasData.date,
          description: mockRepasData.description,
          utilisateur: {
            connect: { id: mockRepasData.utilisateur_id }
          }
        },
        include: {
          utilisateur: true,
          compositions: {
            include: {
              produit: true
            }
          }
        }
      });

      expect(repas).toEqual(mockCreatedRepas);
    });

    it('devrait échouer si la création échoue', async () => {
      const error = new Error('Erreur de création');
      mockPrisma.repas.create.mockRejectedValue(error);

      await expect(RepasModel.creer(mockRepasData)).rejects.toThrow(error);
    });
  });
}); 