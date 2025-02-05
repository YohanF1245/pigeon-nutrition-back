const { PrismaClient } = require('@prisma/client');
const RepasModel = require('../../src/models/repas.model');

let prisma;
let utilisateurTest;
let repasTest;
let produitTest;

describe('RepasModel', () => {
  beforeAll(async () => {
    prisma = new PrismaClient();
    RepasModel.setPrismaClient(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Créer un utilisateur de test
    utilisateurTest = await prisma.utilisateur.create({
      data: {
        email: 'test@test.com',
        mot_de_passe: 'password123',
        nom: 'Test',
        prenom: 'User'
      }
    });

    // Créer un repas de test
    repasTest = await RepasModel.creer({
      nom: 'Petit déjeuner',
      date: new Date('2024-01-28'),
      description: 'Mon petit déjeuner test',
      utilisateur_id: utilisateurTest.id
    });

    // Créer un produit de test
    produitTest = await prisma.produit.create({
      data: {
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
      }
    });
  });

  afterEach(async () => {
    // Nettoyer les données de test dans l'ordre inverse
    if (produitTest) {
      await prisma.produit.deleteMany({
        where: { id: produitTest.id }
      });
    }
    
    if (repasTest) {
      await prisma.repas.deleteMany({
        where: { utilisateur_id: utilisateurTest.id }
      });
    }
    
    if (utilisateurTest) {
      await prisma.utilisateur.delete({
        where: { id: utilisateurTest.id }
      });
    }
  });

  describe('creer', () => {
    it('devrait créer un nouveau repas avec succès', async () => {
      const repas = await RepasModel.creer({
        nom: 'Déjeuner',
        date: new Date('2024-01-28'),
        description: 'Mon déjeuner test',
        utilisateur_id: utilisateurTest.id
      });

      expect(repas).toBeDefined();
      expect(repas.nom).toBe('Déjeuner');
      expect(repas.utilisateur_id).toBe(utilisateurTest.id);
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      await expect(
        RepasModel.creer({
          nom: 'Petit déjeuner',
          date: new Date('2024-01-28'),
          description: 'Mon petit déjeuner test',
          utilisateur_id: 'utilisateur-inexistant'
        })
      ).rejects.toThrow();
    });
  });

  describe('trouverParId', () => {
    it('devrait trouver un repas par son ID', async () => {
      const repas = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);
      expect(repas).toBeDefined();
      expect(repas.id).toBe(repasTest.id);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      const repas = await RepasModel.trouverParId('id-inexistant', utilisateurTest.id);
      expect(repas).toBeNull();
    });

    it('devrait retourner null pour un mauvais utilisateur', async () => {
      const repas = await RepasModel.trouverParId(repasTest.id, 'autre-utilisateur');
      expect(repas).toBeNull();
    });
  });

  describe('lister', () => {
    beforeEach(async () => {
      // Créer quelques repas supplémentaires pour les tests de liste
      await Promise.all([
        RepasModel.creer({
          nom: 'Déjeuner',
          date: new Date('2024-01-28'),
          utilisateur_id: utilisateurTest.id
        }),
        RepasModel.creer({
          nom: 'Dîner',
          date: new Date('2024-01-28'),
          utilisateur_id: utilisateurTest.id
        })
      ]);
    });

    it('devrait lister tous les repas d\'un utilisateur', async () => {
      const repas = await RepasModel.lister(utilisateurTest.id);
      expect(repas).toHaveLength(3); // Le repas de test + les 2 créés dans beforeEach
    });

    it('devrait filtrer les repas par date', async () => {
      const date = new Date('2024-01-28');
      const repas = await RepasModel.lister(utilisateurTest.id, { date });
      expect(repas.every(r => r.date.toISOString().startsWith('2024-01-28'))).toBe(true);
    });

    it('devrait paginer les résultats', async () => {
      const repas = await RepasModel.lister(utilisateurTest.id, { page: 1, limite: 2 });
      expect(repas).toHaveLength(2);
    });
  });

  describe('mettreAJour', () => {
    it('devrait mettre à jour un repas avec succès', async () => {
      const repasModifie = await RepasModel.mettreAJour(
        repasTest.id,
        utilisateurTest.id,
        { nom: 'Petit déjeuner modifié' }
      );

      expect(repasModifie.nom).toBe('Petit déjeuner modifié');
    });

    it('devrait échouer pour un repas inexistant', async () => {
      await expect(
        RepasModel.mettreAJour(
          'id-inexistant',
          utilisateurTest.id,
          { nom: 'Test' }
        )
      ).rejects.toThrow();
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      await expect(
        RepasModel.mettreAJour(
          repasTest.id,
          'autre-utilisateur',
          { nom: 'Test' }
        )
      ).rejects.toThrow();
    });

    it('devrait mettre à jour uniquement les champs fournis', async () => {
      const repasModifie = await RepasModel.mettreAJour(
        repasTest.id,
        utilisateurTest.id,
        { nom: 'Nouveau nom' }
      );

      expect(repasModifie.nom).toBe('Nouveau nom');
      expect(repasModifie.description).toBe(repasTest.description);
    });
  });

  describe('supprimer', () => {
    it('devrait supprimer un repas avec succès', async () => {
      await RepasModel.supprimer(repasTest.id, utilisateurTest.id);
      const repas = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);
      expect(repas).toBeNull();
    });

    it('devrait échouer pour un repas inexistant', async () => {
      await expect(
        RepasModel.supprimer('id-inexistant', utilisateurTest.id)
      ).rejects.toThrow();
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      await expect(
        RepasModel.supprimer(repasTest.id, 'autre-utilisateur')
      ).rejects.toThrow();
    });

    it('devrait supprimer les compositions associées', async () => {
      await RepasModel.ajouterProduit(repasTest.id, produitTest.id, 2);

      await RepasModel.supprimer(repasTest.id, utilisateurTest.id);

      const compositions = await prisma.compositionRepas.findMany({
        where: { repas_id: repasTest.id }
      });
      expect(compositions).toHaveLength(0);
    });
  });

  describe('gestion des produits', () => {
    describe('ajouterProduit', () => {
      it('devrait ajouter un produit au repas', async () => {
        const composition = await RepasModel.ajouterProduit(repasTest.id, produitTest.id, 2);
        expect(composition).toBeDefined();
        expect(composition.produit.id).toBe(produitTest.id);
        expect(composition.quantite).toBe(2);
      });

      it('devrait échouer pour un repas inexistant', async () => {
        await expect(
          RepasModel.ajouterProduit('id-inexistant', produitTest.id, 2)
        ).rejects.toThrow();
      });

      it('devrait échouer pour un produit inexistant', async () => {
        await expect(
          RepasModel.ajouterProduit(repasTest.id, 'id-inexistant', 2)
        ).rejects.toThrow();
      });
    });

    describe('supprimerProduit', () => {
      let compositionTest;

      beforeEach(async () => {
        compositionTest = await RepasModel.ajouterProduit(repasTest.id, produitTest.id, 2);
      });

      it('devrait supprimer un produit du repas', async () => {
        await RepasModel.supprimerProduit(repasTest.id, compositionTest.id, utilisateurTest.id);
        const compositions = await prisma.compositionRepas.findMany({
          where: { repas_id: repasTest.id }
        });
        expect(compositions).toHaveLength(0);
      });

      it('devrait échouer pour une composition inexistante', async () => {
        await expect(
          RepasModel.supprimerProduit(repasTest.id, 'id-inexistant', utilisateurTest.id)
        ).rejects.toThrow();
      });

      it('devrait échouer pour un mauvais utilisateur', async () => {
        await expect(
          RepasModel.supprimerProduit(repasTest.id, compositionTest.id, 'autre-utilisateur')
        ).rejects.toThrow();
      });
    });

    describe('calculerNutriments', () => {
      beforeEach(async () => {
        await RepasModel.ajouterProduit(repasTest.id, produitTest.id, 100);
      });

      it('devrait calculer les nutriments totaux du repas', async () => {
        const nutriments = await RepasModel.calculerNutriments(repasTest.id, utilisateurTest.id);
        expect(nutriments).toEqual({
          calories_total: 265,
          matieres_grasses_total: 3.2,
          glucides_total: 49,
          proteines_total: 9,
          sel_total: 0.6
        });
      });

      it('devrait retourner null pour un repas inexistant', async () => {
        const nutriments = await RepasModel.calculerNutriments('id-inexistant', utilisateurTest.id);
        expect(nutriments).toBeNull();
      });

      it('devrait retourner null pour un mauvais utilisateur', async () => {
        const nutriments = await RepasModel.calculerNutriments(repasTest.id, 'autre-utilisateur');
        expect(nutriments).toBeNull();
      });

      it('devrait calculer correctement pour plusieurs produits', async () => {
        const produit2 = await prisma.produit.create({
          data: {
            nom: 'Beurre',
            calories: 717,
            matieres_grasses: 81,
            glucides: 0.1,
            proteines: 0.8,
            sel: 0.1,
            stock: 100,
            prix_unitaire: 3.5,
            stock_limite: 10,
            unite_stock: 'UNITE'
          }
        });

        await RepasModel.ajouterProduit(repasTest.id, produit2.id, 10);

        const nutriments = await RepasModel.calculerNutriments(repasTest.id, utilisateurTest.id);
        expect(nutriments).toEqual({
          calories_total: 265 + 71.7,
          matieres_grasses_total: 3.2 + 8.1,
          glucides_total: 49 + 0.01,
          proteines_total: 9 + 0.08,
          sel_total: 0.6 + 0.01
        });

        await prisma.produit.delete({ where: { id: produit2.id } });
      });
    });
  });
}); 