const mongoose = require('mongoose');
const redis = require('redis');
const neo4j = require('neo4j-driver');

class DatabaseConnections {
  constructor() {
    this.mongoConnection = null;
    this.redisClient = null;
    this.neo4jDriver = null;
  }

  async connectMongoDB() {
    try {
      this.mongoConnection = await mongoose.connect(
        process.env.MONGODB_URI
      );
      console.log('MongoDB connecté');
    } catch (error) {
      console.error('Erreur MongoDB:', error);
      process.exit(1);
    }
  }

  async connectRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URI
      });
      
      await this.redisClient.connect();
      console.log('Redis connecté');
      return this.redisClient;
    } catch (error) {
      console.error('Erreur Redis:', error);
      process.exit(1);
    }
  }

  connectNeo4j() {
    try {
      this.neo4jDriver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD || 'password')
      );
      console.log('Neo4j connecté');
      return this.neo4jDriver;
    } catch (error) {
      console.error('Erreur Neo4j:', error);
      process.exit(1);
    }
  }

  async closeAll() {
    if (this.mongoConnection) await mongoose.disconnect();
    if (this.redisClient) await this.redisClient.quit();
    if (this.neo4jDriver) await this.neo4jDriver.close();
  }
}

module.exports = new DatabaseConnections();