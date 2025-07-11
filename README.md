# SupDeVinci - Module NoSQL - Travel Hub

Une application complète utilisant Express JS, MongoDB, Redis et Neo4j.

## 🏗️ Architecture

- **API**
- **Bases de données** 
  - **MongoDB** 
  - **Redis** 
  - **Neo4j** 

## 📋 Prérequis

- **Node.js** v16+ 
- **Docker** 
- **MongoDB Compass** 
- **Git**

## 🚀 Installation et lancement

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd travel-hub
```

### 2. Structure du projet

```
travel-hub/
├── api/          
│   ├── src/
│   │   ├── config/       
│   │   ├── models/       
│   │   ├── routes/       
│   │   ├── services/     
│   │   └── middleware/   
│   ├── scripts/          
│   └── docker-compose.yml
    └── public/
```

## 🔧 Configuration Backend

### 1. Aller dans le dossier backend

```bash
cd api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Créer le fichier `.env` :

```bash
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://admin:password@localhost:27017/travel_hub?authSource=admin

REDIS_URI=redis://redis:6379

NEO4J_URI=bolt://neo4j:7687
NEO4J_PASSWORD=password
```
Note pour accèder au données mongo compass ajouter le lien suivant : mongodb://admin:password@localhost:27017/?authSource=admin

### 4. Lancer les services avec Docker

```bash
docker-compose up -d

docker-compose ps
```

**Services disponibles :**
- **MongoDB** : `localhost:27017` (admin/password)
- **Redis** : `localhost:6379`
- **Neo4j** : `localhost:7474` (neo4j/password) - Interface web

### 5. Configurer Neo4j

Ouvrir http://localhost:7474 dans le navigateur :
- **Login** : neo4j
- **Password** : password

Exécuter cette requête Cypher pour créer le graphe des villes :

```cypher
// Créer de nouvelles villes
CREATE (berlin:City {code:"BER", name:"Berlin", country:"DE", weight:0.78})
CREATE (amsterdam:City {code:"AMS", name:"Amsterdam", country:"NL", weight:0.72})
CREATE (vienna:City {code:"VIE", name:"Vienna", country:"AT", weight:0.76})
CREATE (lisbon:City {code:"LIS", name:"Lisbon", country:"PT", weight:0.7})
CREATE (chicago:City {code:"CHI", name:"Chicago", country:"US", weight:0.82})
CREATE (seoul:City {code:"SEL", name:"Seoul", country:"KR", weight:0.79})

// Créer des relations NEAR entre ces villes
CREATE (berlin)-[:NEAR {weight:0.65}]->(vienna)
CREATE (berlin)-[:NEAR {weight:0.7}]->(amsterdam)
CREATE (amsterdam)-[:NEAR {weight:0.6}]->(lisbon)
CREATE (vienna)-[:NEAR {weight:0.5}]->(lisbon)
CREATE (seoul)-[:NEAR {weight:0.6}]->(tokyo)
CREATE (chicago)-[:NEAR {weight:0.75}]->(nyc)
CREATE (chicago)-[:NEAR {weight:0.55}]->(london)
CREATE (lisbon)-[:NEAR {weight:0.65}]->(madrid)

RETURN "Nouveau jeu de données créé avec succès"
```

### 6. Peupler MongoDB avec des données de test

```bash
npm run seed
```

### 7. Démarrer le serveur backend

```bash
# Mode développement
npm run dev

# Ou mode production
npm start
```

**Le serveur sera disponible sur :** http://localhost:3001

### Backend (`api/`)

```bash
npm run dev          
npm start            
npm run seed         
```

## 🏗️ API Endpoints

### Authentification
- `POST /auth/register` - Création de compte
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil utilisateur
- `POST /auth/logout` - Déconnexion

### Offres de voyage
- `GET /offers?from=BER&to=AMS&limit=10` - Recherche d'offres
- `GET /offers/:id` - Détails d'une offre avec offres liées

### Recommandations
- `GET /reco?city=PAR&k=3` - Recommandations de villes

### Système
- `GET /health` - État des services
