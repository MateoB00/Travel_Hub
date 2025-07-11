require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const DatabaseConnections = require('./config/database');
const CacheService = require('./services/service-cache');
const Neo4jService = require('./services/service-neo');

const offersRoutes = require('./routes/route-offers');
const { router: authRoutes } = require('./routes/route-auth');
const recoRoutes = require('./routes/route-reco');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(compression());

let cacheService, neoService;

app.use((req, res, next) => {
  req.cacheService = cacheService;
  req.neoService = neoService;
  next();
});

app.use('/offers', offersRoutes);
app.use('/auth', authRoutes);
app.use('/reco', recoRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
  });
});


async function startServer() {
  try {
    await DatabaseConnections.connectMongoDB();
    const redisClient = await DatabaseConnections.connectRedis();
    const neo4jDriver = DatabaseConnections.connectNeo4j();

    cacheService = new CacheService(redisClient);
    neoService = new Neo4jService(neo4jDriver);

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await DatabaseConnections.closeAll();
  process.exit(0);
});

startServer();

module.exports = app;