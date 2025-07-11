const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class CacheService {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async getOffers(from, to) {
    const key = `offers:${from}:${to}`;
    try {
      const compressed = await this.redis.get(key);
      if (!compressed) return null;
      
      const decompressed = await gunzip(Buffer.from(compressed, 'base64'));
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error('Erreur lecture cache:', error);
      return null;
    }
  }

  async setOffers(from, to, offers, ttl = 60) {
    const key = `offers:${from}:${to}`;
    try {
      const json = JSON.stringify(offers);
      const compressed = await gzip(json);
      await this.redis.setEx(key, ttl, compressed.toString('base64'));
    } catch (error) {
      console.error('Erreur écriture cache:', error);
    }
  }

  async getOfferDetails(id) {
    const key = `offers:${id}`;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lecture détails:', error);
      return null;
    }
  }

  async setOfferDetails(id, offer, ttl = 300) {
    const key = `offers:${id}`;
    try {
      await this.redis.setEx(key, ttl, JSON.stringify(offer));
    } catch (error) {
      console.error('Erreur écriture détails:', error);
    }
  }

  async createSession(uuid, userId, ttl = 900) {
    const key = `session:${uuid}`;
    await this.redis.setEx(key, ttl, userId);
  }

  async getSession(uuid) {
    const key = `session:${uuid}`;
    return await this.redis.get(key);
  }

  async publishNewOffer(offerId, from, to) {
    const message = JSON.stringify({ offerId, from, to });
    await this.redis.publish('offers:new', message);
  }
}

module.exports = CacheService;