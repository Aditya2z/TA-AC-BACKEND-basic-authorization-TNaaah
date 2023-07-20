var express = require("express");
var router = express.Router();
var Comment = require("../models/comment");
var Article = require("../models/article");
var auth = require("../middlewares/auth");

// Like Comments
router.get("/:id/likes", auth.isLoggedIn, function (req, res, next) {
  Comment.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then((updatedComment) => {
      res.redirect("/articles/" + updatedComment.articleId);
    })
    .catch((err) => {
      next(err);
    });
});

// Update Comments
router.get("/:id/update", auth.isLoggedIn, auth.isCommentAuthor, async function (req, res, next) {
  try {
    const comment = await Comment.findById(req.params.id);
    res.render("updateComment", { comment: comment });
  } catch (err) {
    next(err);
  }
});

router.post("/:id", auth.isLoggedIn, auth.isCommentAuthor, function (req, res, next) {
  const commentId = req.params.id;

  Comment.findByIdAndUpdate(commentId, req.body, { new: true })
    .then((updatedComment) => {
      res.redirect("/articles/" + updatedComment.articleId);
    })
    .catch((err) => {
      next(err);
    });
});

// Delete Comments
router.get("/:id/delete", auth.isLoggedIn, auth.isCommentAuthor, function (req, res, next) {
  const commentId = req.params.id;

  Comment.findByIdAndRemove(commentId)
    .then((deletedComment) => {
      Article.findByIdAndUpdate(deletedComment.articleId, {
        $pull: { comments: deletedComment._id },
      })
        .then((updatedArticle) => {
          res.redirect("/articles/" + updatedArticle._id);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
