const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RepasModel {
    static async creer(repasData) {
        const { utilisateur_id, nom, date, description } = repasData;

        return prisma.repas.create({
            data: {
                nom,
                date: new Date(date),
                description,
                utilisateur: {
                    connect: { id: utilisateur_id }
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
    }

    static async ajouterProduit(repas_id, produit_id, quantite) {
        return prisma.compositionRepas.create({
            data: {
                repas: {
                    connect: { id: repas_id }
                },
                produit: {
                    connect: { id: produit_id }
                },
                quantite
            },
            include: {
                produit: true
            }
        });
    }

    static async trouverParId(id, utilisateur_id) {
        return prisma.repas.findFirst({
            where: {
                id,
                utilisateur_id
            },
            include: {
                compositions: {
                    include: {
                        produit: true
                    }
                }
            }
        });
    }

    static async lister(utilisateur_id, options = {}) {
        const { date, limite = 10, page = 1 } = options;
        const skip = (page - 1) * limite;

        const where = {
            utilisateur_id
        };

        if (date) {
            where.date = new Date(date);
        }

        return prisma.repas.findMany({
            where,
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
            take: limite,
            skip
        });
    }

    static async mettreAJour(id, utilisateur_id, repasData) {
        const { nom, date, description } = repasData;

        return prisma.repas.update({
            where: {
                id_utilisateur_id: {
                    id,
                    utilisateur_id
                }
            },
            data: {
                ...(nom && { nom }),
                ...(date && { date: new Date(date) }),
                ...(description !== undefined && { description })
            },
            include: {
                compositions: {
                    include: {
                        produit: true
                    }
                }
            }
        });
    }

    static async supprimer(id, utilisateur_id) {
        return prisma.repas.delete({
            where: {
                id_utilisateur_id: {
                    id,
                    utilisateur_id
                }
            }
        });
    }

    static async supprimerProduit(repas_id, composition_id, utilisateur_id) {
        // Vérifier d'abord que le repas appartient à l'utilisateur
        const repas = await this.trouverParId(repas_id, utilisateur_id);
        if (!repas) return null;

        return prisma.compositionRepas.delete({
            where: {
                id: composition_id
            }
        });
    }

    static async calculerNutriments(repas_id, utilisateur_id) {
        const repas = await prisma.repas.findFirst({
            where: {
                id: repas_id,
                utilisateur_id
            },
            include: {
                compositions: {
                    include: {
                        produit: true
                    }
                }
            }
        });

        if (!repas) return null;

        // Calculer les totaux
        return repas.compositions.reduce((totaux, composition) => {
            const { produit, quantite } = composition;
            const facteur = produit.unite_stock === 'TRANCHE' 
                ? (quantite * produit.poids_par_tranche) / 100 
                : quantite / 100;

            return {
                calories_total: (totaux.calories_total || 0) + produit.calories * facteur,
                matieres_grasses_total: (totaux.matieres_grasses_total || 0) + produit.matieres_grasses * facteur,
                glucides_total: (totaux.glucides_total || 0) + produit.glucides * facteur,
                proteines_total: (totaux.proteines_total || 0) + produit.proteines * facteur,
                sel_total: (totaux.sel_total || 0) + produit.sel * facteur
            };
        }, {});
    }
}

module.exports = RepasModel; 