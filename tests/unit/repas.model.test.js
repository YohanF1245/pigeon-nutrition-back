const { PrismaClient } = require('@prisma/client');
const RepasModel = require('../../src/models/repas.model');

const prisma = new PrismaClient();

describe('RepasModel', () => {
  let utilisateurTest;

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
  });

  describe('creer', () => {
    it('devrait créer un nouveau repas avec succès', async () => {
      const repasData = {
        nom: 'Petit déjeuner',
        date: new Date('2024-01-28'),
        description: 'Mon petit déjeuner test',
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
}); 