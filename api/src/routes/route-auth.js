const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/model-user');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log(req.body)
    const { username, email, password, firstName, lastName } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email et password sont requis' 
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        error: existingUser.email === email.toLowerCase() 
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName
    });

    await user.save();

    const token = uuidv4();
    const expiresIn = 900; 
    
    await req.cacheService.createSession(token, user._id.toString(), expiresIn);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: user.toPublicJSON(),
      token,
      expires_in: expiresIn
    });

  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ 
        error: 'Login et mot de passe requis' 
      });
    }

    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ],
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Identifiants incorrects' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Mot de passe incorrect' 
      });
    }

    const token = uuidv4();
    const expiresIn = 900;
    
    await req.cacheService.createSession(token, user._id.toString(), expiresIn);

    res.json({
      message: 'Connexion réussie',
      user: user.toPublicJSON(),
      token,
      expires_in: expiresIn
    });

  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const userId = await req.cacheService.getSession(token);

    if (!userId) {
      return res.status(401).json({ error: 'Session expirée' });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      user: user.toPublicJSON()
    });

  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const sessionKey = `session:${token}`;
      await req.cacheService.redis.del(sessionKey);
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: `Erreur serveur ${error}` });
  }
});

module.exports = { router };