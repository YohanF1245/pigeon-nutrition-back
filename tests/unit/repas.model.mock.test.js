/**
 * @jest-environment node
 */

const mockPrisma = require('../mocks/prisma.mock');
const RepasModel = require('../../src/models/repas.model');

// Injecter le mock Prisma
RepasModel.setPrismaClient(mockPrisma);

describe('RepasModel - Create', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepasData = {
    nom: 'Petit déjeuner',
    date: mockDate,
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123'
  };

  const mockCreatedRepas = {
    id: 'repas-123',
    nom: mockRepasData.nom,
    date: mockDate,
    description: mockRepasData.description,
    utilisateur_id: mockRepasData.utilisateur_id,
    utilisateur: {
      id: mockRepasData.utilisateur_id,
      nom: 'Test User'
    },
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
          date: mockDate,
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
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepas = {
    id: 'repas-123',
    nom: 'Petit déjeuner',
    date: mockDate,
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
      date: mockDate,
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
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas]);

      await RepasModel.lister('user-123', { date: mockDate });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            utilisateur_id: 'user-123',
            date: mockDate
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

describe('RepasModel - Update', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepas = {
    id: 'repas-123',
    nom: 'Petit déjeuner',
    date: mockDate,
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123',
    compositions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mettreAJour', () => {
    it('devrait mettre à jour un repas avec succès', async () => {
      const miseAJour = {
        nom: 'Petit déjeuner modifié',
        description: 'Description modifiée'
      };

      const repasModifie = { ...mockRepas, ...miseAJour };
      mockPrisma.repas.update.mockResolvedValue(repasModifie);

      const repas = await RepasModel.mettreAJour(mockRepas.id, mockRepas.utilisateur_id, miseAJour);

      expect(mockPrisma.repas.update).toHaveBeenCalledWith({
        where: {
          id_utilisateur_id: {
            id: mockRepas.id,
            utilisateur_id: mockRepas.utilisateur_id
          }
        },
        data: {
          nom: miseAJour.nom,
          description: miseAJour.description
        },
        include: {
          compositions: {
            include: {
              produit: true
            }
          }
        }
      });

      expect(repas).toEqual(repasModifie);
    });

    it('devrait mettre à jour uniquement les champs fournis', async () => {
      const miseAJour = {
        nom: 'Nouveau nom'
      };

      const repasModifie = { ...mockRepas, nom: miseAJour.nom };
      mockPrisma.repas.update.mockResolvedValue(repasModifie);

      const repas = await RepasModel.mettreAJour(mockRepas.id, mockRepas.utilisateur_id, miseAJour);

      expect(mockPrisma.repas.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            nom: miseAJour.nom
          }
        })
      );

      expect(repas.nom).toBe(miseAJour.nom);
      expect(repas.description).toBe(mockRepas.description);
    });

    it('devrait gérer la mise à jour de la date', async () => {
      const nouvelleDate = new Date('2024-01-29T00:00:00.000Z');
      const miseAJour = {
        date: nouvelleDate
      };

      const repasModifie = { ...mockRepas, date: nouvelleDate };
      mockPrisma.repas.update.mockResolvedValue(repasModifie);

      await RepasModel.mettreAJour(mockRepas.id, mockRepas.utilisateur_id, miseAJour);

      expect(mockPrisma.repas.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            date: nouvelleDate
          }
        })
      );
    });

    it('devrait échouer si le repas n\'existe pas', async () => {
      mockPrisma.repas.update.mockRejectedValue(new Error('Repas non trouvé'));

      await expect(
        RepasModel.mettreAJour('inexistant', mockRepas.utilisateur_id, { nom: 'Test' })
      ).rejects.toThrow('Repas non trouvé');
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      mockPrisma.repas.update.mockRejectedValue(new Error('Non autorisé'));

      await expect(
        RepasModel.mettreAJour(mockRepas.id, 'mauvais-utilisateur', { nom: 'Test' })
      ).rejects.toThrow('Non autorisé');
    });
  });
});

describe('RepasModel - Delete', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepas = {
    id: 'repas-123',
    nom: 'Petit déjeuner',
    date: mockDate,
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123',
    compositions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('supprimer', () => {
    it('devrait supprimer un repas avec succès', async () => {
      mockPrisma.repas.delete.mockResolvedValue(mockRepas);

      const repas = await RepasModel.supprimer(mockRepas.id, mockRepas.utilisateur_id);

      expect(mockPrisma.repas.delete).toHaveBeenCalledWith({
        where: {
          id_utilisateur_id: {
            id: mockRepas.id,
            utilisateur_id: mockRepas.utilisateur_id
          }
        }
      });

      expect(repas).toEqual(mockRepas);
    });

    it('devrait échouer si le repas n\'existe pas', async () => {
      mockPrisma.repas.delete.mockRejectedValue(new Error('Repas non trouvé'));

      await expect(
        RepasModel.supprimer('inexistant', mockRepas.utilisateur_id)
      ).rejects.toThrow('Repas non trouvé');
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      mockPrisma.repas.delete.mockRejectedValue(new Error('Non autorisé'));

      await expect(
        RepasModel.supprimer(mockRepas.id, 'mauvais-utilisateur')
      ).rejects.toThrow('Non autorisé');
    });
  });

  describe('supprimerProduit', () => {
    const mockComposition = {
      id: 'comp-123',
      repas_id: 'repas-123',
      produit_id: 'produit-123',
      quantite: 2
    };

    it('devrait supprimer un produit du repas avec succès', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(mockRepas);
      mockPrisma.compositionRepas.delete.mockResolvedValue(mockComposition);

      const resultat = await RepasModel.supprimerProduit(
        mockRepas.id,
        mockComposition.id,
        mockRepas.utilisateur_id
      );

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

      expect(mockPrisma.compositionRepas.delete).toHaveBeenCalledWith({
        where: {
          id: mockComposition.id
        }
      });

      expect(resultat).toEqual(mockComposition);
    });

    it('devrait retourner null si le repas n\'existe pas', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(null);

      const resultat = await RepasModel.supprimerProduit(
        'inexistant',
        mockComposition.id,
        mockRepas.utilisateur_id
      );

      expect(resultat).toBeNull();
      expect(mockPrisma.compositionRepas.delete).not.toHaveBeenCalled();
    });

    it('devrait échouer si la composition n\'existe pas', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(mockRepas);
      mockPrisma.compositionRepas.delete.mockRejectedValue(new Error('Composition non trouvée'));

      await expect(
        RepasModel.supprimerProduit(mockRepas.id, 'inexistant', mockRepas.utilisateur_id)
      ).rejects.toThrow('Composition non trouvée');
    });
  });
});

describe('RepasModel - Gestion des produits', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockProduit = {
    id: 'produit-123',
    nom: 'Pain',
    calories: 265,
    matieres_grasses: 3.2,
    glucides: 49,
    proteines: 9,
    sel: 0.6,
    stock: 100,
    prix_unitaire: 2.5,
    stock_limite: 10,
    unite_stock: 'UNITE'
  };

  const mockRepas = {
    id: 'repas-123',
    nom: 'Petit déjeuner',
    date: mockDate,
    description: 'Mon petit déjeuner test',
    utilisateur_id: 'user-123',
    compositions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ajouterProduit', () => {
    const mockComposition = {
      id: 'comp-123',
      repas_id: mockRepas.id,
      produit_id: mockProduit.id,
      quantite: 2,
      produit: mockProduit
    };

    it('devrait ajouter un produit au repas avec succès', async () => {
      mockPrisma.compositionRepas.create.mockResolvedValue(mockComposition);

      const composition = await RepasModel.ajouterProduit(mockRepas.id, mockProduit.id, 2);

      expect(mockPrisma.compositionRepas.create).toHaveBeenCalledWith({
        data: {
          repas: {
            connect: { id: mockRepas.id }
          },
          produit: {
            connect: { id: mockProduit.id }
          },
          quantite: 2
        },
        include: {
          produit: true
        }
      });

      expect(composition).toEqual(mockComposition);
    });

    it('devrait échouer si le repas n\'existe pas', async () => {
      mockPrisma.compositionRepas.create.mockRejectedValue(new Error('Repas non trouvé'));

      await expect(
        RepasModel.ajouterProduit('inexistant', mockProduit.id, 2)
      ).rejects.toThrow('Repas non trouvé');
    });

    it('devrait échouer si le produit n\'existe pas', async () => {
      mockPrisma.compositionRepas.create.mockRejectedValue(new Error('Produit non trouvé'));

      await expect(
        RepasModel.ajouterProduit(mockRepas.id, 'inexistant', 2)
      ).rejects.toThrow('Produit non trouvé');
    });

    it('devrait échouer si la quantité est invalide', async () => {
      mockPrisma.compositionRepas.create.mockRejectedValue(new Error('Quantité invalide'));

      await expect(
        RepasModel.ajouterProduit(mockRepas.id, mockProduit.id, -1)
      ).rejects.toThrow('Quantité invalide');
    });
  });
}); 