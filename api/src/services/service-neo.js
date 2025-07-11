
const neo4j = require('neo4j-driver');

class Neo4jService {
    constructor(driver) {
      this.driver = driver;
    }
  
    async getRecommendations(cityCode, k = 3) {
      const session = this.driver.session();
      try {
        const result = await session.run(
          `MATCH (c:City {code: $city})-[:NEAR]->(n:City)
           RETURN n.code AS city, n.name AS name, n.weight AS score 
           ORDER BY n.weight DESC 
           LIMIT $k`,
          { 
            city: cityCode, 
            k: neo4j.int(k)
          }
        );
  
        return result.records.map(record => ({
          city: record.get('city'),
          name: record.get('name'),
          score: record.get('score')
        }));
      } finally {
        await session.close();
      }
    }
  
    async getRelatedOffers(cityCode, limit = 3) {
      const session = this.driver.session();
      try {
        const result = await session.run(
          `MATCH (c:City {code: $city})-[:NEAR]->(n:City)
           RETURN n.code AS city 
           ORDER BY n.weight DESC 
           LIMIT $limit`,
          { 
            city: cityCode, 
            limit: neo4j.int(limit)
          }
        );
  
        return result.records.map(record => record.get('city'));
      } finally {
        await session.close();
      }
    }
  
    async close() {
      await this.driver.close();
    }
  }
  
  module.exports = Neo4jService;