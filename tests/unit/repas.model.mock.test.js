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

describe('RepasModel - Calcul des nutriments', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockProduit1 = {
    id: 'produit-123',
    nom: 'Pain',
    calories: 265,
    matieres_grasses: 3.2,
    glucides: 49,
    proteines: 9,
    sel: 0.6,
    unite_stock: 'UNITE'
  };

  const mockProduit2 = {
    id: 'produit-456',
    nom: 'Beurre',
    calories: 717,
    matieres_grasses: 81,
    glucides: 0.1,
    proteines: 0.8,
    sel: 0.1,
    unite_stock: 'UNITE'
  };

  const mockRepas = {
    id: 'repas-123',
    utilisateur_id: 'user-123',
    nom: 'Petit déjeuner',
    date: mockDate,
    compositions: [
      {
        produit: mockProduit1,
        quantite: 100 // 100g de pain
      },
      {
        produit: mockProduit2,
        quantite: 10 // 10g de beurre
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculerNutriments', () => {
    it('devrait calculer correctement les nutriments totaux', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(mockRepas);

      const nutriments = await RepasModel.calculerNutriments(mockRepas.id, mockRepas.utilisateur_id);

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

      // Vérification des calculs
      // Pain: 100g = valeurs telles quelles
      // Beurre: 10g = valeurs / 10
      expect(nutriments).toEqual({
        calories_total: 265 + 71.7,
        matieres_grasses_total: 3.2 + 8.1,
        glucides_total: 49 + 0.01,
        proteines_total: 9 + 0.08,
        sel_total: 0.6 + 0.01
      });
    });

    it('devrait retourner null si le repas n\'existe pas', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(null);

      const nutriments = await RepasModel.calculerNutriments('inexistant', 'user-123');

      expect(nutriments).toBeNull();
    });

    it('devrait calculer correctement pour un produit en tranches', async () => {
      const mockProduitTranche = {
        ...mockProduit1,
        unite_stock: 'TRANCHE',
        poids_par_tranche: 30 // 30g par tranche
      };

      const mockRepasAvecTranches = {
        ...mockRepas,
        compositions: [{
          produit: mockProduitTranche,
          quantite: 2 // 2 tranches
        }]
      };

      mockPrisma.repas.findFirst.mockResolvedValue(mockRepasAvecTranches);

      const nutriments = await RepasModel.calculerNutriments(mockRepas.id, mockRepas.utilisateur_id);

      // 2 tranches de 30g = 60g
      // 60g = 60% des valeurs nutritionnelles pour 100g
      expect(nutriments).toEqual({
        calories_total: 265 * 0.6,
        matieres_grasses_total: 3.2 * 0.6,
        glucides_total: 49 * 0.6,
        proteines_total: 9 * 0.6,
        sel_total: 0.6 * 0.6
      });
    });

    it('devrait gérer un repas sans compositions', async () => {
      const mockRepasVide = {
        ...mockRepas,
        compositions: []
      };

      mockPrisma.repas.findFirst.mockResolvedValue(mockRepasVide);

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
});

describe('RepasModel - Gestion des erreurs', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepas = {
    id: 'repas-123',
    utilisateur_id: 'user-123',
    nom: 'Petit déjeuner',
    date: mockDate,
    compositions: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gestion des erreurs de base de données', () => {
    it('devrait gérer les erreurs de connexion', async () => {
      const erreur = new Error('Erreur de connexion à la base de données');
      mockPrisma.$connect.mockRejectedValue(erreur);

      await expect(
        RepasModel.creer({
          nom: 'Test',
          date: mockDate,
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow('Erreur de connexion à la base de données');
    });

    it('devrait gérer les erreurs de transaction', async () => {
      const erreur = new Error('Erreur de transaction');
      mockPrisma.$executeRawUnsafe.mockRejectedValue(erreur);

      await expect(
        RepasModel.creer({
          nom: 'Test',
          date: mockDate,
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow('Erreur de transaction');
    });

    it('devrait gérer les erreurs de contrainte unique', async () => {
      const erreur = new Error('Unique constraint failed');
      mockPrisma.repas.create.mockRejectedValue(erreur);

      await expect(
        RepasModel.creer({
          nom: 'Test',
          date: mockDate,
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('gestion des cas limites', () => {
    it('devrait gérer une date invalide', async () => {
      await expect(
        RepasModel.creer({
          nom: 'Test',
          date: 'date-invalide',
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow();
    });

    it('devrait gérer un ID utilisateur invalide', async () => {
      mockPrisma.repas.create.mockRejectedValue(new Error('Foreign key constraint failed'));

      await expect(
        RepasModel.creer({
          nom: 'Test',
          date: mockDate,
          utilisateur_id: 'invalid-user'
        })
      ).rejects.toThrow('Foreign key constraint failed');
    });

    it('devrait gérer une quantité de produit invalide', async () => {
      await expect(
        RepasModel.ajouterProduit(mockRepas.id, 'produit-123', -1)
      ).rejects.toThrow();

      await expect(
        RepasModel.ajouterProduit(mockRepas.id, 'produit-123', 0)
      ).rejects.toThrow();
    });

    it('devrait gérer un repas sans date', async () => {
      await expect(
        RepasModel.creer({
          nom: 'Test',
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow();
    });

    it('devrait gérer un repas sans nom', async () => {
      await expect(
        RepasModel.creer({
          date: mockDate,
          utilisateur_id: 'user-123'
        })
      ).rejects.toThrow();
    });
  });
});

describe('RepasModel - Pagination et Filtrage', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
  const mockRepas = [
    {
      id: 'repas-1',
      nom: 'Petit déjeuner',
      date: mockDate,
      utilisateur_id: 'user-123',
      compositions: []
    },
    {
      id: 'repas-2',
      nom: 'Déjeuner',
      date: mockDate,
      utilisateur_id: 'user-123',
      compositions: []
    },
    {
      id: 'repas-3',
      nom: 'Dîner',
      date: mockDate,
      utilisateur_id: 'user-123',
      compositions: []
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pagination', () => {
    it('devrait paginer les résultats correctement', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas[0], mockRepas[1]]);

      const resultat = await RepasModel.lister('user-123', { page: 1, limite: 2 });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
          skip: 0
        })
      );

      expect(resultat).toHaveLength(2);
      expect(resultat[0].id).toBe('repas-1');
      expect(resultat[1].id).toBe('repas-2');
    });

    it('devrait gérer la dernière page', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas[2]]);

      const resultat = await RepasModel.lister('user-123', { page: 2, limite: 2 });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
          skip: 2
        })
      );

      expect(resultat).toHaveLength(1);
      expect(resultat[0].id).toBe('repas-3');
    });

    it('devrait retourner un tableau vide pour une page sans résultats', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([]);

      const resultat = await RepasModel.lister('user-123', { page: 3, limite: 2 });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
          skip: 4
        })
      );

      expect(resultat).toHaveLength(0);
    });
  });

  describe('filtrage par date', () => {
    it('devrait filtrer les repas par date', async () => {
      mockPrisma.repas.findMany.mockResolvedValue([mockRepas[0]]);

      const resultat = await RepasModel.lister('user-123', { date: mockDate });

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: mockDate
          })
        })
      );

      expect(resultat).toHaveLength(1);
      expect(resultat[0].date).toEqual(mockDate);
    });

    it('devrait retourner tous les repas si aucune date n\'est spécifiée', async () => {
      mockPrisma.repas.findMany.mockResolvedValue(mockRepas);

      const resultat = await RepasModel.lister('user-123', {});

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            date: expect.anything()
          })
        })
      );

      expect(resultat).toHaveLength(3);
    });
  });

  describe('tri des résultats', () => {
    it('devrait trier les repas par date décroissante', async () => {
      const repasAvecDatesDifferentes = [
        { ...mockRepas[0], date: new Date('2024-01-28') },
        { ...mockRepas[1], date: new Date('2024-01-27') },
        { ...mockRepas[2], date: new Date('2024-01-26') }
      ];

      mockPrisma.repas.findMany.mockResolvedValue(repasAvecDatesDifferentes);

      const resultat = await RepasModel.lister('user-123');

      expect(mockPrisma.repas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { date: 'desc' },
            { date_creation: 'desc' }
          ]
        })
      );

      expect(resultat[0].date).toEqual(new Date('2024-01-28'));
      expect(resultat[2].date).toEqual(new Date('2024-01-26'));
    });
  });
});

describe('RepasModel - Validation et Permissions', () => {
  const mockDate = new Date('2024-01-28T00:00:00.000Z');
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation des données', () => {
    it('devrait valider le format de la date', async () => {
      const repasData = {
        nom: 'Test',
        date: '2024-01-28T00:00:00.000Z',
        utilisateur_id: mockUtilisateur.id
      };

      mockPrisma.repas.create.mockResolvedValue({
        ...mockRepas,
        date: new Date(repasData.date)
      });

      const repas = await RepasModel.creer(repasData);
      expect(repas.date).toBeInstanceOf(Date);
    });

    it('devrait valider la longueur du nom', async () => {
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
      ).rejects.toThrow('Non autorisé');
    });

    it('devrait empêcher la suppression des repas d\'un autre utilisateur', async () => {
      mockPrisma.repas.delete.mockRejectedValue(new Error('Non autorisé'));

      await expect(
        RepasModel.supprimer(mockRepas.id, 'autre-utilisateur')
      ).rejects.toThrow('Non autorisé');
    });

    it('devrait empêcher l\'ajout de produits aux repas d\'un autre utilisateur', async () => {
      mockPrisma.repas.findFirst.mockResolvedValue(null);

      const resultat = await RepasModel.supprimerProduit(
        mockRepas.id,
        'comp-123',
        'autre-utilisateur'
      );

      expect(resultat).toBeNull();
    });
  });
}); 