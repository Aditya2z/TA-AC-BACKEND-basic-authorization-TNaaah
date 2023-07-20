var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: [
      String
    ],
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

articleSchema.pre("save", function (next) {
  if (this.title && this.isModified("title")) {
    generateSlug(this.title)
      .then((slug) => {
        this.slug = slug;
        next();
      })
      .catch((error) => next(error));
  } else {
    next();
  }
});

// implementation of generateSlug function using a promise
function generateSlug(title) {
  return new Promise((resolve, reject) => {
    const slug = title.toLowerCase().trim().split(" ").join("_");
    resolve(slug);
  });
}

module.exports = mongoose.model("Article", articleSchema);
