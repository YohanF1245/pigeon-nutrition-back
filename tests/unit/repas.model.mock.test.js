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

describe('RepasModel - Read', () => {
  const mockRepas = {
    id: 'repas-123',
    nom: 'Petit déjeuner',
    date: new Date('2024-01-28'),
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123',
    compositions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trouverParId', () => {
    it('devrait trouver un repas par son ID', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(mockRepas);

      const repas = await RepasModel.trouverParId(mockRepas.id, mockRepas.utilisateur_id);

      expect(mockPrisma.repas.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockRepas.id,
          utilisateur_id: mockRepas.utilisateur_id
        },
        include: {
          compositions: {
            include: {
              produit: true
            }
          }
        }
      });

      expect(repas).toEqual(mockRepas);
    });

    it('devrait retourner null si le repas n\'existe pas', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(null);

      const repas = await RepasModel.trouverParId('inexistant', 'user-123');

      expect(repas).toBeNull();
    });
  });

  describe('lister', () => {
    const mockRepas2 = {
      id: 'repas-456',
      nom: 'Déjeuner',
      date: new Date('2024-01-28'),
      utilisateur_id: 'user-123',
      compositions: []
    };

    it('devrait lister tous les repas d\'un utilisateur', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas, mockRepas2]);

      const repas = await RepasModel.lister('user-123');

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith({
        where: { utilisateur_id: 'user-123' },
        include: {
          compositions: {
            include: {
              produit: true
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { date_creation: 'desc' }
        ],
        take: 10,
        skip: 0
      });

      expect(repas).toHaveLength(2);
      expect(repas).toEqual([mockRepas, mockRepas2]);
    });

    it('devrait filtrer les repas par date', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas, mockRepas2]);

      const date = new Date('2024-01-28');
      await RepasModel.lister('user-123', { date });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            utilisateur_id: 'user-123',
            date: date
          }
        })
      );
    });

    it('devrait paginer les résultats', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas]);

      await RepasModel.lister('user-123', { page: 2, limite: 5 });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 5
        })
      );
    });

    it('devrait gérer une erreur de base de données', async () => {
      const error = new Error('Erreur de base de données');
      mockPrisma.repas.findMany.mockRejectedValue(error);

      await expect(RepasModel.lister('user-123')).rejects.toThrow(error);
    });
  });
}); 