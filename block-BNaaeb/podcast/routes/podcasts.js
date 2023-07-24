const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Podcast = require("../models/podcast");
const multer = require("multer");

const upload = multer({ dest: "./uploads" });

// Display the Upload Podcast form
router.get("/", auth.isUserLogged, (req, res) => {
  const successMessage = req.flash("success");
  const errorMessage = req.flash("error");
  res.render("uploadPodcast", { successMessage, errorMessage });
});

// Route to handle the form submission and audio file upload
router.post(
  "/upload", auth.isUserLogged,
  upload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const { title, description, category } = req.body;
    const audioFile = req.files["audioFile"][0];
    const coverImage = req.files["coverImage"][0];
    const host = req.session.userId;

    // Create a new Podcast document using Mongoose schema
    Podcast.create({
      title,
      description,
      host,
      category,
      episodes: [
        {
          title,
          description,
          audioFileURL: `uploads/${audioFile.filename}`,
          coverImageURL: `uploads/${coverImage.filename}`,
          duration: 0,
        },
      ],
    })
      .then(() => {
        req.flash("success", "Podcast uploaded successfully!");
        res.redirect('/users/dashboard');
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Route to render the edit podcast form
router.get('/edit/:id', auth.isAdmin, (req, res, next) => {
  const podcastId = req.params.id;

  // Fetch the podcast by its id
  Podcast.findById(podcastId)
    .then((podcast) => {
      if (!podcast) {
        // If podcast not found, handle the error
        return res.status(404).send('Podcast not found.');
      }

      // Render the edit podcast form with the podcast data
      res.render('editPodcast', { podcast });
    })
    .catch((err) => {
      // Handle any errors that occur during fetching the podcast
      next(err);
    });
});

// Route to handle the form submission for editing a podcast
router.post('/edit/:id', auth.isAdmin, (req, res, next) => {
  const podcastId = req.params.id;
  const { title, description, category } = req.body;

  // Find the podcast by its id and update its details
  Podcast.findByIdAndUpdate(podcastId, { title, description, category })
    .then(() => {
      res.redirect('/admin/dashboard');
    })
    .catch((err) => {
      next(err);
    });
});

// Route to handle deleting a podcast
router.get('/delete/:id', auth.isAdmin, (req, res, next) => {
  const podcastId = req.params.id;

  // Find the podcast by its id and remove it from the database
  Podcast.findByIdAndDelete(podcastId)
    .then(() => {
      res.redirect('/admin/dashboard');
    })
    .catch((err) => {
      next(err);
    });
});


// Route to display all episodes of a specific podcast
router.get('/:id/episodes', auth.isUserLogged, (req, res, next) => {
  const podcastId = req.params.id;

  // Find the podcast by its ID and populate the episodes field
  Podcast.findById(podcastId)
    .populate('episodes')
    .then((podcast) => {
      if (!podcast) {
        // If the podcast is not found, handle the error or redirect to an error page
        return res.status(404).send('Podcast not found');
      }

      const userMembership = req.user ? req.user.membership : 'free';

      if (userMembership === 'premium') {
        // PREMIUM member can view everything
        res.render('episodes', { podcast });
      } else if (userMembership === 'vip') {
        // VIP member can view free + VIP podcasts
        if (podcast.category === 'free' || podcast.category === 'vip') {
          res.render('episodes', { podcast });
        } else {
          // If not allowed, handle the error or redirect to an error page
          req.flash("error", "Upgrade the membership");
          res.redirect('/users/dashboard');
        }
      } else {
        // Free member can view free podcasts
        if (podcast.category === 'free') {
          res.render('episodes', { podcast });
        } else {
          // If not allowed, handle the error or redirect to an error page
          req.flash("error", "Upgrade the membership");
          res.redirect('/users/dashboard');
        }
      }
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
