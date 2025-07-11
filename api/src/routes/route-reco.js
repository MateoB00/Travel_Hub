const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { city, k = 3 } = req.query;
    
    if (!city) {
      return res.status(400).json({ 
        error: 'Paramètres requis' 
      });
    }

    const recommendations = await req.neoService.getRecommendations(
      city, 
      parseInt(k) 
    );

    res.json({
      city,
      recommendations
    });

  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

module.exports = router;