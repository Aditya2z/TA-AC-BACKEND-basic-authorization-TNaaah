var express = require('express');
const Podcast = require('../models/podcast');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const successMessage = req.flash('success');
  const errorMessage = req.flash('error');
  
  Podcast.find({})
    .sort({ createdAt: -1 }) // Sort episodes in descending order of createdAt
    .limit(2) // Limit the results to only the latest episode
    .populate('host')
    .then((latestEpisodes) => {
      res.render('index', { successMessage, errorMessage, latestEpisodes });
    })
    .catch((err) => {
      console.error('Error fetching latest episode:', err);
      res.render('index', { successMessage, errorMessage, latestEpisode: null });
    });
});

module.exports = router;
