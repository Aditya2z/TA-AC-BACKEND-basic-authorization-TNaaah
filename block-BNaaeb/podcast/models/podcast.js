var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var podcastSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    host: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    episodes: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        audioFileURL: {
          type: String,
          required: true,
        },
        coverImageURL: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
      },
      { timestamps: true },
    ],
    category: {
      type: String,
      required: true,
      enum: ["free", "vip", "premium"],
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

var Podcast = mongoose.model("Podcast", podcastSchema);

module.exports = Podcast;
