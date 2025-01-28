const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardModel {
    static async getStatistiquesJournalieres(utilisateurId, date) {
        const debut = new Date(date);
        debut.setHours(0, 0, 0, 0);
        
        const fin = new Date(date);
        fin.setHours(23, 59, 59, 999);

        const repas = await prisma.repas.findMany({
            where: {
                utilisateur_id: utilisateurId,
                date: {
                    gte: debut,
                    lte: fin
                }
            },
            include: {
                compositions: {
                    include: {
                        produit: true
                    }
                },
                statistiques: true
            }
        });

        return repas;
    }

    static async getApportsNutritionnels(utilisateurId, dateDebut, dateFin) {
        const debut = new Date(dateDebut);
        debut.setHours(0, 0, 0, 0);
        
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999);

        const statistiques = await prisma.statistiqueRepas.findMany({
            where: {
                repas: {
                    utilisateur_id: utilisateurId,
                    date: {
                        gte: debut,
                        lte: fin
                    }
                }
            },
            include: {
                repas: true
            }
        });

        // Calculer les moyennes
        const nombreJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
        const totaux = statistiques.reduce((acc, stat) => ({
            calories: acc.calories + stat.calories_total,
            glucides: acc.glucides + stat.glucides_total,
            proteines: acc.proteines + stat.proteines_total,
            lipides: acc.lipides + stat.lipides_total,
            sel: acc.sel + stat.sel_total
        }), { calories: 0, glucides: 0, proteines: 0, lipides: 0, sel: 0 });

        return {
            moyennes: {
                calories: totaux.calories / nombreJours,
                glucides: totaux.glucides / nombreJours,
                proteines: totaux.proteines / nombreJours,
                lipides: totaux.lipides / nombreJours,
                sel: totaux.sel / nombreJours
            },
            totaux,
            statistiques
        };
    }

    static async getStocksBas(utilisateurId) {
        return prisma.produit.findMany({
            where: {
                AND: [
                    { utilisateur_id: utilisateurId },
                    {
                        stock: {
                            lte: prisma.produit.fields.stock_limite
                        }
                    }
                ]
            },
            orderBy: {
                stock: 'asc'
            }
        });
    }

    static async getTendancesConsommation(utilisateurId, nombreJours = 30) {
        const dateDebut = new Date();
        dateDebut.setDate(dateDebut.getDate() - nombreJours);
        dateDebut.setHours(0, 0, 0, 0);

        const statistiques = await prisma.statistiqueRepas.findMany({
            where: {
                repas: {
                    utilisateur_id: utilisateurId,
                    date: {
                        gte: dateDebut
                    }
                }
            },
            include: {
                repas: true
            },
            orderBy: {
                repas: {
                    date: 'asc'
                }
            }
        });

        // Grouper par jour
        const tendances = statistiques.reduce((acc, stat) => {
            const date = stat.repas.date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    calories: 0,
                    glucides: 0,
                    proteines: 0,
                    lipides: 0,
                    sel: 0
                };
            }
            acc[date].calories += stat.calories_total;
            acc[date].glucides += stat.glucides_total;
            acc[date].proteines += stat.proteines_total;
            acc[date].lipides += stat.lipides_total;
            acc[date].sel += stat.sel_total;
            return acc;
        }, {});

        return Object.entries(tendances).map(([date, valeurs]) => ({
            date,
            ...valeurs
        }));
    }

    static async genererRapportNutritionnel(utilisateurId, dateDebut, dateFin) {
        const apports = await this.getApportsNutritionnels(utilisateurId, dateDebut, dateFin);
        
        return prisma.rapportNutritionnel.create({
            data: {
                utilisateur: {
                    connect: { id: utilisateurId }
                },
                date_debut: new Date(dateDebut),
                date_fin: new Date(dateFin),
                calories_moyenne: apports.moyennes.calories,
                glucides_moyenne: apports.moyennes.glucides,
                proteines_moyenne: apports.moyennes.proteines,
                lipides_moyenne: apports.moyennes.lipides,
                sel_moyenne: apports.moyennes.sel
            }
        });
    }
}

module.exports = DashboardModel; 