var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
  },
  image_url: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Product", productSchema);
