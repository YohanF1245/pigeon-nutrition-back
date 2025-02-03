const { PrismaClient } = require('@prisma/client');
const RepasModel = require('../../src/models/repas.model');

const prisma = new PrismaClient();

describe('RepasModel', () => {
  let utilisateurTest;
  let repasTest;

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
  });

  describe('creer', () => {
    it('devrait créer un nouveau repas avec succès', async () => {
      const repasData = {
        nom: 'Déjeuner',
        date: new Date('2024-01-28'),
        description: 'Mon déjeuner test',
        utilisateur_id: utilisateurTest.id
      };

      const repas = await RepasModel.creer(repasData);

      expect(repas).toBeDefined();
      expect(repas.nom).toBe(repasData.nom);
      expect(repas.description).toBe(repasData.description);
      expect(repas.utilisateur_id).toBe(utilisateurTest.id);
      expect(new Date(repas.date)).toEqual(repasData.date);
      expect(repas.compositions).toEqual([]);
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      const repasData = {
        nom: 'Petit déjeuner',
        date: new Date('2024-01-28'),
        description: 'Mon petit déjeuner test',
        utilisateur_id: 'utilisateur-inexistant'
      };

      await expect(RepasModel.creer(repasData)).rejects.toThrow();
    });
  });

  describe('trouverParId', () => {
    it('devrait trouver un repas par son ID', async () => {
      const repas = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);

      expect(repas).toBeDefined();
      expect(repas.id).toBe(repasTest.id);
      expect(repas.nom).toBe(repasTest.nom);
      expect(repas.utilisateur_id).toBe(utilisateurTest.id);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      const repas = await RepasModel.trouverParId('id-inexistant', utilisateurTest.id);
      expect(repas).toBeNull();
    });

    it('devrait retourner null pour un mauvais utilisateur', async () => {
      const repas = await RepasModel.trouverParId(repasTest.id, 'mauvais-utilisateur');
      expect(repas).toBeNull();
    });
  });

  describe('lister', () => {
    beforeEach(async () => {
      // Créer plusieurs repas pour les tests de liste
      await RepasModel.creer({
        nom: 'Déjeuner',
        date: new Date('2024-01-28'),
        description: 'Mon déjeuner test',
        utilisateur_id: utilisateurTest.id
      });

      await RepasModel.creer({
        nom: 'Dîner',
        date: new Date('2024-01-28'),
        description: 'Mon dîner test',
        utilisateur_id: utilisateurTest.id
      });
    });

    it('devrait lister tous les repas d\'un utilisateur', async () => {
      const repas = await RepasModel.lister(utilisateurTest.id);

      expect(Array.isArray(repas)).toBe(true);
      expect(repas.length).toBe(3); // Le repas de test + les 2 créés dans beforeEach
      expect(repas[0].utilisateur_id).toBe(utilisateurTest.id);
    });

    it('devrait filtrer les repas par date', async () => {
      const repas = await RepasModel.lister(utilisateurTest.id, {
        date: new Date('2024-01-28')
      });

      expect(Array.isArray(repas)).toBe(true);
      expect(repas.length).toBe(3);
      repas.forEach(r => {
        expect(new Date(r.date).toDateString()).toBe(new Date('2024-01-28').toDateString());
      });
    });

    it('devrait paginer les résultats', async () => {
      const repas = await RepasModel.lister(utilisateurTest.id, {
        limite: 2,
        page: 1
      });

      expect(Array.isArray(repas)).toBe(true);
      expect(repas.length).toBe(2);
    });
  });

  describe('mettreAJour', () => {
    it('devrait mettre à jour un repas avec succès', async () => {
      const miseAJour = {
        nom: 'Petit déjeuner modifié',
        description: 'Description modifiée'
      };

      const repas = await RepasModel.mettreAJour(repasTest.id, utilisateurTest.id, miseAJour);

      expect(repas).toBeDefined();
      expect(repas.id).toBe(repasTest.id);
      expect(repas.nom).toBe(miseAJour.nom);
      expect(repas.description).toBe(miseAJour.description);
      expect(repas.utilisateur_id).toBe(utilisateurTest.id);
    });

    it('devrait échouer pour un repas inexistant', async () => {
      const miseAJour = {
        nom: 'Petit déjeuner modifié'
      };

      await expect(
        RepasModel.mettreAJour('id-inexistant', utilisateurTest.id, miseAJour)
      ).rejects.toThrow();
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      const miseAJour = {
        nom: 'Petit déjeuner modifié'
      };

      await expect(
        RepasModel.mettreAJour(repasTest.id, 'mauvais-utilisateur', miseAJour)
      ).rejects.toThrow();
    });

    it('devrait mettre à jour uniquement les champs fournis', async () => {
      const miseAJour = {
        nom: 'Nouveau nom'
      };

      const repas = await RepasModel.mettreAJour(repasTest.id, utilisateurTest.id, miseAJour);

      expect(repas.nom).toBe(miseAJour.nom);
      expect(repas.description).toBe(repasTest.description); // La description ne devrait pas changer
    });
  });

  describe('supprimer', () => {
    it('devrait supprimer un repas avec succès', async () => {
      const repas = await RepasModel.supprimer(repasTest.id, utilisateurTest.id);

      expect(repas).toBeDefined();
      expect(repas.id).toBe(repasTest.id);

      // Vérifier que le repas a bien été supprimé
      const repasSupp = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);
      expect(repasSupp).toBeNull();
    });

    it('devrait échouer pour un repas inexistant', async () => {
      await expect(
        RepasModel.supprimer('id-inexistant', utilisateurTest.id)
      ).rejects.toThrow();
    });

    it('devrait échouer pour un mauvais utilisateur', async () => {
      await expect(
        RepasModel.supprimer(repasTest.id, 'mauvais-utilisateur')
      ).rejects.toThrow();
    });

    it('devrait supprimer les compositions associées', async () => {
      // Créer un produit de test
      const produit = await prisma.produit.create({
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
          utilisateur: {
            connect: { id: utilisateurTest.id }
          }
        }
      });

      // Ajouter le produit au repas
      await RepasModel.ajouterProduit(repasTest.id, produit.id, 2);

      // Vérifier que la composition existe
      const repasAvant = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);
      expect(repasAvant.compositions.length).toBe(1);

      // Supprimer le repas
      await RepasModel.supprimer(repasTest.id, utilisateurTest.id);

      // Vérifier que le repas et ses compositions ont été supprimés
      const repasApres = await RepasModel.trouverParId(repasTest.id, utilisateurTest.id);
      expect(repasApres).toBeNull();

      const compositions = await prisma.compositionRepas.findMany({
        where: { repas_id: repasTest.id }
      });
      expect(compositions.length).toBe(0);
    });
  });
}); 