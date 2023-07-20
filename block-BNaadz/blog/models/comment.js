var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  content: {type: String},
  likes: {type: Number, default: 0},
  author: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  articleId: {type: Schema.Types.ObjectId, ref: "Article"},
}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);
