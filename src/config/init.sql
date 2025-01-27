-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE unite_stock_type AS ENUM ('UNITE', 'POURCENTAGE', 'TRANCHE');
CREATE TYPE role_type AS ENUM ('ADMIN', 'USER');

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role role_type DEFAULT 'USER',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID REFERENCES utilisateurs(id),
    nom VARCHAR(100) NOT NULL,
    code_barre VARCHAR(13) NOT NULL,
    calories DECIMAL(10,2) NOT NULL,
    matieres_grasses DECIMAL(10,2) NOT NULL,
    glucides DECIMAL(10,2) NOT NULL,
    proteines DECIMAL(10,2) NOT NULL,
    sel DECIMAL(10,2) NOT NULL,
    stock DECIMAL(10,2) NOT NULL,
    unite_stock unite_stock_type NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    stock_limite DECIMAL(10,2) NOT NULL,
    poids_par_tranche DECIMAL(10,2),  -- Poids en grammes par tranche (NULL si pas de tranches)
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id, code_barre),
    UNIQUE(utilisateur_id, nom),
    CHECK (
        (unite_stock = 'TRANCHE' AND poids_par_tranche IS NOT NULL) OR
        (unite_stock != 'TRANCHE' AND poids_par_tranche IS NULL)
    )
);

-- Table des repas
CREATE TABLE IF NOT EXISTS repas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID REFERENCES utilisateurs(id),
    nom VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table de composition des repas
CREATE TABLE IF NOT EXISTS composition_repas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repas_id UUID REFERENCES repas(id),
    produit_id UUID REFERENCES produits(id),
    quantite DECIMAL(10,2) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_repas FOREIGN KEY (repas_id) REFERENCES repas(id) ON DELETE CASCADE,
    CONSTRAINT fk_produit FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Trigger pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_utilisateur_date_modification
    BEFORE UPDATE ON utilisateurs
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER update_produit_date_modification
    BEFORE UPDATE ON produits
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

CREATE TRIGGER update_repas_date_modification
    BEFORE UPDATE ON repas
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification(); 