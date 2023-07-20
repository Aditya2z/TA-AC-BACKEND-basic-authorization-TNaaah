var express = require("express");
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");

var auth = require("../middlewares/auth");
const comment = require("../models/comment");

/* GET articles listing. */
router.get("/", function (req, res, next) {
  const selectedTag = req.query.tag;
  const query = selectedTag ? { tags: selectedTag } : {};

  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  Article.find(query)
    .then((articleList) => {
      const allTags = new Set();

      articleList.forEach((article) => {
        article.tags.forEach((tag) => {
          allTags.add(tag);
        });
      });

      res.render("articleList", {
        articles: articleList,
        success: success,
        error: error,
        allTags: Array.from(allTags),
      });
    })
    .catch((err) => {
      next(err);
    });
});

// Get new Article form
router.get("/new", auth.isLoggedIn, function (req, res, next) {
  res.render("newArticleForm");
});

/* Create article. */
router.post("/", auth.isLoggedIn, function (req, res, next) {
  req.body.tags = req.body.tags.trim().split(" ");
  req.body.author = req.user._id;
  Article.create(req.body)
    .then(() => {
      res.redirect("/articles");
    })
    .catch((err) => {
      next(err);
    });
});

// Get Single Article Details and Comments
router.get("/:id", function (req, res, next) {
  Article.findById(req.params.id)
    .populate("author")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .then((article) => {
      res.render("articleDetails", { article: article });
    })
    .catch((err) => {
      next(err);
    });
});

// Update Article Details form
router.get(
  "/:id/update",
  auth.isLoggedIn,
  auth.isAuthor,
  function (req, res, next) {
    Article.findById(req.params.id)
      .then((article) => {
        article.tags = article.tags.join(" ");
        res.render("updateArticleForm", { article: article });
      })
      .catch((err) => {
        next(err);
      });
  }
);

//Update Article
router.post("/:id", auth.isLoggedIn, auth.isAuthor, function (req, res, next) {
  req.body.author = req.user._id;
  req.body.tags = req.body.tags.trim().split(" ");
  Article.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedArticle) => {
      res.render("articleDetails", { article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
});

//Delete Article
router.get(
  "/:id/delete",
  auth.isLoggedIn,
  auth.isAuthor,
  function (req, res, next) {
    Article.findByIdAndDelete(req.params.id)
      .then((deletedArticle) => {
        Comment.deleteMany({ articleId: deletedArticle._id })
          .then(() => {
            res.redirect("/articles");
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Handle Likes
router.get("/:id/likes", auth.isLoggedIn, function (req, res, next) {
  Article.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then((updatedArticle) => {
      res.render("articleDetails", { article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
});

// Create Comments
router.post("/:id/comments", auth.isLoggedIn, async function (req, res, next) {
  const id = req.params.id;
  req.body.articleId = id;
  req.body.author = req.user._id;

  await Comment.create(req.body)
    .then((newComment) => {
      Article.findByIdAndUpdate(
        id,
        {
          $push: { comments: newComment._id },
        },
        { new: true }
      ).then(() => {
        res.redirect("/articles/" + id);
      });
    })
    .catch((err) => {
      next(err);
    });
});

//My articles
router.get("/:userId/my_articles", auth.isLoggedIn, (req, res, next) => {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  Article.find({ author: req.params.userId })
    .then((articleList) => {
      const allTags = new Set();

      articleList.forEach((article) => {
        article.tags.forEach((tag) => {
          allTags.add(tag);
        });
      });

      res.render("articleList", {
        articles: articleList,
        success: success,
        error: error,
        allTags: Array.from(allTags)
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
