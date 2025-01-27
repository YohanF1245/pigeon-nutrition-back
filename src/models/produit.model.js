const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProduitModel {
    static async creer(produitData) {
        const { utilisateur_id, ...reste } = produitData;
        
        return prisma.produit.create({
            data: {
                ...reste,
                utilisateur: {
                    connect: { id: utilisateur_id }
                }
            }
        });
    }

    static async trouverParId(id) {
        return prisma.produit.findUnique({
            where: { id },
            include: {
                utilisateur: true
            }
        });
    }

    static async trouverParCodeBarre(codeBarre) {
        return prisma.produit.findFirst({
            where: { code_barre: codeBarre }
        });
    }

    static async lister(utilisateurId) {
        return prisma.produit.findMany({
            where: {
                utilisateur: {
                    id: utilisateurId
                }
            }
        });
    }

    static async mettreAJour(id, produitData) {
        const { utilisateur_id, ...reste } = produitData;
        
        // S'assurer que stock_limite est défini
        if (reste.stock_limite === undefined || reste.stock_limite === null) {
            reste.stock_limite = 0;
        }
        
        return prisma.produit.update({
            where: { id },
            data: reste,
            include: {
                utilisateur: true
            }
        });
    }

    static async supprimer(id) {
        return prisma.produit.delete({
            where: { id },
            include: {
                utilisateur: true
            }
        });
    }

    static async mettreAJourStock(id, quantite) {
        const produit = await this.trouverParId(id);
        if (!produit) return null;

        return prisma.produit.update({
            where: { id },
            data: {
                stock: {
                    increment: quantite
                }
            },
            include: {
                utilisateur: true
            }
        });
    }

    static async verifierStocksBas(utilisateurId) {
        return prisma.produit.findMany({
            where: {
                AND: [
                    {
                        utilisateur: {
                            id: utilisateurId
                        }
                    },
                    {
                        stock: {
                            lte: prisma.produit.fields.stock_limite
                        }
                    }
                ]
            },
            include: {
                utilisateur: true
            }
        });
    }

    static async getValeursNutritionnellesParTranche(id, utilisateurId) {
        const produit = await prisma.produit.findFirst({
            where: {
                AND: [
                    { id },
                    {
                        utilisateur: {
                            id: utilisateurId
                        }
                    },
                    {
                        unite_stock: 'TRANCHE'
                    }
                ]
            }
        });

        if (!produit) return null;

        // Calculer les valeurs nutritionnelles par tranche
        return {
            ...produit,
            calories_par_tranche: produit.calories / produit.stock,
            matieres_grasses_par_tranche: produit.matieres_grasses / produit.stock,
            glucides_par_tranche: produit.glucides / produit.stock,
            proteines_par_tranche: produit.proteines / produit.stock,
            sel_par_tranche: produit.sel / produit.stock
        };
    }
}

module.exports = ProduitModel; 