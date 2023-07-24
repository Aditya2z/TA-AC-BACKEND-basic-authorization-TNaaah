const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Podcast = require("../models/podcast");

// Admin Dashboard
router.get('/dashboard', auth.isUserLogged, auth.isAdmin, async (req, res) => {
  try {
    const allPodcasts = await Podcast.find({});

    // Separate podcasts based on category
    const freePodcasts = allPodcasts.filter(podcast => podcast.category === 'free');
    const vipPodcasts = allPodcasts.filter(podcast => podcast.category === 'vip');
    const premiumPodcasts = allPodcasts.filter(podcast => podcast.category === 'premium');

    res.render('adminDashboard', {
      freePodcasts,
      vipPodcasts,
      premiumPodcasts
    });
  } catch (err) {
    console.error('Error fetching podcasts:', err);
    res.render('adminDashboard', {
      freePodcasts: [],
      vipPodcasts: [],
      premiumPodcasts: []
    });
  }
});

module.exports = router;
