const express = require('express');
const Offer = require('../models/model-offer');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { from, to, limit = 10, q } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Paramètres from et to requis' 
      });
    }

    const cached = await req.cacheService.getOffers(from, to);
    if (cached) {
      return res.json({ 
        offers: cached.slice(0, parseInt(limit)),
        cached: true 
      });
    }

    let query = { from, to };
    if (q) {
      query.$text = { $search: q };
    }

    const offers = await Offer.find(query)
      .sort({ price: 1 })
      .limit(parseInt(limit))
      .lean();

    await req.cacheService.setOffers(from, to, offers);

    res.json({ offers, cached: false });
  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cached = await req.cacheService.getOfferDetails(id);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const offer = await Offer.findById(id).lean();
    if (!offer) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    const relatedCities = await req.neoService.getRelatedOffers(offer.from);

    const relatedOffers = await Offer.find({
      from: { $in: relatedCities },
      to: offer.to,
      _id: { $ne: offer._id }
    }).limit(3).select('_id').lean();

    const result = {
      ...offer,
      relatedOffers: relatedOffers.map(o => o._id.toString())
    };

    await req.cacheService.setOfferDetails(id, result);

    res.json({ ...result, cached: false });
  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

module.exports = router;