-- CreateEnum
CREATE TYPE "UniteStock" AS ENUM ('UNITE', 'POURCENTAGE', 'TRANCHE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code_barre" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "matieres_grasses" DOUBLE PRECISION NOT NULL,
    "glucides" DOUBLE PRECISION NOT NULL,
    "proteines" DOUBLE PRECISION NOT NULL,
    "sel" DOUBLE PRECISION NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL,
    "unite_stock" "UniteStock" NOT NULL,
    "prix_unitaire" DOUBLE PRECISION NOT NULL,
    "stock_limite" DOUBLE PRECISION NOT NULL,
    "poids_par_tranche" DOUBLE PRECISION,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repas" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "composition_repas" (
    "id" TEXT NOT NULL,
    "repas_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "composition_repas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "produits_utilisateur_id_code_barre_key" ON "produits"("utilisateur_id", "code_barre");

-- CreateIndex
CREATE UNIQUE INDEX "produits_utilisateur_id_nom_key" ON "produits"("utilisateur_id", "nom");

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repas" ADD CONSTRAINT "repas_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_repas" ADD CONSTRAINT "composition_repas_repas_id_fkey" FOREIGN KEY ("repas_id") REFERENCES "repas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "composition_repas" ADD CONSTRAINT "composition_repas_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE CASCADE; 