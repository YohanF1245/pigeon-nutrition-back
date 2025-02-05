/**
 * @jest-environment node
 */

const mockPrisma = require('../mocks/prisma.mock');
const RepasModel = require('../../src/models/repas.model');

// Mock data
const mockDate = new Date('2024-01-28');
const mockUtilisateur = {
  id: 'user-123',
  email: 'test@test.com',
  nom: 'Test',
  prenom: 'User'
};

const mockRepas = {
  id: 'repas-123',
  nom: 'Petit déjeuner',
  date: mockDate,
  description: 'Description test',
  utilisateur_id: mockUtilisateur.id,
  compositions: []
};

const mockRepasData = {
  nom: mockRepas.nom,
  date: mockDate,
  description: mockRepas.description,
  utilisateur_id: mockUtilisateur.id
};

describe('RepasModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    RepasModel.setPrismaClient(mockPrisma);

    // Configuration des mocks par défaut
    mockPrisma.repas.create.mockResolvedValue(mockRepas);
    mockPrisma.repas.findFirst.mockResolvedValue(mockRepas);
    mockPrisma.repas.findMany.mockResolvedValue([mockRepas]);
    mockPrisma.repas.update.mockResolvedValue(mockRepas);
    mockPrisma.repas.delete.mockResolvedValue(mockRepas);
  });

  describe('creer', () => {
    it('devrait créer un nouveau repas avec succès', async () => {
      const repas = await RepasModel.creer(mockRepasData);

      expect(repas).toEqual(mockRepas);
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
    });

    it('devrait échouer si la création échoue', async () => {
      const error = new Error('Erreur de création');
      mockPrisma.repas.create.mockRejectedValue(error);

      await expect(RepasModel.creer(mockRepasData)).rejects.toThrow(error);
    });
  });

  describe('trouverParId', () => {
    it('devrait trouver un repas par son ID', async () => {
      const repas = await RepasModel.trouverParId(mockRepas.id, mockUtilisateur.id);

      expect(repas).toEqual(mockRepas);
      expect(mockPrisma.repas.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockRepas.id,
          utilisateur_id: mockUtilisateur.id
        },
        include: {
          compositions: {
            include: {
              produit: true
            }
          }
        }
      });
    });

    it('devrait retourner null si le repas n\'existe pas', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(null);

      const repas = await RepasModel.trouverParId('id-inexistant', mockUtilisateur.id);
      expect(repas).toBeNull();
    });
  });

  describe('lister', () => {
    it('devrait lister les repas avec pagination', async () => {
      const options = { page: 2, limite: 10 };
      await RepasModel.lister(mockUtilisateur.id, options);

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith({
        where: { utilisateur_id: mockUtilisateur.id },
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
        skip: 10
      });
    });

    it('devrait filtrer par date', async () => {
      const options = { date: mockDate };
      await RepasModel.lister(mockUtilisateur.id, options);

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith({
        where: {
          utilisateur_id: mockUtilisateur.id,
          date: mockDate
        },
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
    });
  });

  describe('calculerNutriments', () => {
    const mockProduit = {
      id: 'produit-123',
      calories: 100,
      matieres_grasses: 5,
      glucides: 20,
      proteines: 10,
      sel: 0.5,
      unite_stock: 'UNITE'
    };

    const mockComposition = {
      produit: mockProduit,
      quantite: 200
    };

    it('devrait calculer les nutriments totaux', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue({
        ...mockRepas,
        compositions: [mockComposition]
      });

      const nutriments = await RepasModel.calculerNutriments(mockRepas.id, mockRepas.utilisateur_id);

      expect(nutriments).toEqual({
        calories_total: 200,
        matieres_grasses_total: 10,
        glucides_total: 40,
        proteines_total: 20,
        sel_total: 1
      });
    });

    it('devrait gérer un repas sans compositions', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue({
        ...mockRepas,
        compositions: []
      });

      const nutriments = await RepasModel.calculerNutriments(mockRepas.id, mockRepas.utilisateur_id);

      expect(nutriments).toEqual({
        calories_total: 0,
        matieres_grasses_total: 0,
        glucides_total: 0,
        proteines_total: 0,
        sel_total: 0
      });
    });
  });

  describe('gestion des erreurs', () => {
    describe('gestion des erreurs de base de données', () => {
      it('devrait gérer les erreurs de connexion', async () => {
        mockPrisma.repas.create.mockRejectedValue(new Error('Erreur de connexion à la base de données'));

        await expect(
          RepasModel.creer({
            nom: 'Test',
            date: mockDate,
            utilisateur_id: 'user-123'
          })
        ).rejects.toThrow('Erreur de connexion à la base de données');
      });

      it('devrait gérer les erreurs de transaction', async () => {
        mockPrisma.repas.create.mockImplementation(() => {
          throw new Error('Erreur de transaction');
        });

        await expect(
          RepasModel.creer({
            nom: 'Test',
            date: mockDate,
            utilisateur_id: 'user-123'
          })
        ).rejects.toThrow('Erreur de transaction');
      });
    });

    describe('validation et permissions', () => {
      describe('validation des données', () => {
        it('devrait valider la longueur du nom', async () => {
          mockPrisma.repas.create.mockRejectedValue(new Error('Le nom est trop long'));
          const nomTropLong = 'a'.repeat(101);
          
          await expect(
            RepasModel.creer({
              nom: nomTropLong,
              date: mockDate,
              utilisateur_id: mockUtilisateur.id
            })
          ).rejects.toThrow();
        });

        it('devrait valider la longueur de la description', async () => {
          mockPrisma.repas.create.mockRejectedValue(new Error('La description est trop longue'));
          const descriptionTropLongue = 'a'.repeat(501);
          
          await expect(
            RepasModel.creer({
              nom: 'Test',
              date: mockDate,
              description: descriptionTropLongue,
              utilisateur_id: mockUtilisateur.id
            })
          ).rejects.toThrow();
        });
      });

      describe('gestion des permissions', () => {
        it('devrait empêcher l\'accès aux repas d\'un autre utilisateur', async () => {
          mockPrisma.repas.findFirst.mockResolvedValue(null);

          const resultat = await RepasModel.trouverParId(
            mockRepas.id,
            'autre-utilisateur'
          );

          expect(resultat).toBeNull();
        });

        it('devrait empêcher la modification des repas d\'un autre utilisateur', async () => {
          mockPrisma.repas.update.mockRejectedValue(new Error('Non autorisé'));

          await expect(
            RepasModel.mettreAJour(
              mockRepas.id,
              'autre-utilisateur',
              { nom: 'Nouveau nom' }
            )
          ).rejects.toThrow();
        });
      });
    });
  });
}); 