var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var Cart = require("../models/cart");
var auth = require("../middlewares/auth");

// Get new Product form
router.get("/new", auth.isAdmin, function (req, res, next) {
  res.render("newProduct");
});

/* Create product. */
router.post("/", auth.isAdmin, function (req, res, next) {
  req.body.category = req.body.category.trim().split(" ");
  Product.create(req.body)
    .then(() => {
      res.redirect("/products");
    })
    .catch((err) => {
      next(err);
    });
});

/* GET products listing. */
router.get("/",function (req, res, next) {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];

  const selectedCategory = req.query.category;
  const query = selectedCategory ? { category: selectedCategory } : {};

  Product.find(query)
    .then((productList) => {
      const allCategories = new Set();

      productList.forEach((product) => {
        product.category.forEach((category) => {
          allCategories.add(category);
        });
      });

      res.render("products", {
        products: productList,
        error: error,
        success: success,
        allCategories: Array.from(allCategories)
      });
    })
    .catch((err) => {
      next(err);
    });
});

//to show cart
router.get("/cart", auth.isLoggedIn, function (req, res, next) {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  const userId = req.session.userId;
  Cart.findOne({ user: userId })
    .populate("items.product")
    .then((cart) => {
      res.render("cart", { cart: cart, error: error, success: success });
    });
});

router.get("/categories", auth.isAdmin, (req, res, next) => {
  Product.find({})
    .then((productList) => {
      const allCategories = new Set();

      productList.forEach((product) => {
        product.category.forEach((category) => {
          allCategories.add(category);
        });
      });

      res.render("dashboard", {
        allCategories: Array.from(allCategories)
      });
   });
});

// Get Single Product Details
router.get("/:id", function (req, res, next) {
  Product.findById(req.params.id)
    .then((product) => {
      res.render("productDetails", { product: product });
    })
    .catch((err) => {
      next(err);
    });
});

// Update Product Details form
router.get("/:id/update", auth.isAdmin, function (req, res, next) {
  Product.findById(req.params.id)
    .then((product) => {
      product.category = product.category.join(" ");
      res.render("updateProduct", { product: product });
    })
    .catch((err) => {
      next(err);
    });
});

//Update Product
router.post("/:id", auth.isAdmin, function (req, res, next) {
  req.body.category = req.body.category.trim().split(" ");
  Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedProduct) => {
      res.render("productDetails", { product: updatedProduct });
    })
    .catch((err) => {
      next(err);
    });
});

//Delete Product
router.get("/:id/delete", auth.isAdmin, function (req, res, next) {
  Product.findByIdAndDelete(req.params.id)
    .then((deletedProduct) => {
      Comment.deleteMany({ articleId: deletedProduct._id })
        .then(() => {
          res.redirect("/products");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

// Add product to cart
router.get("/:id/cart/add", auth.isLoggedIn, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const quantity = 1;
    const product = await Product.findById(productId);

    // Check if the user already has a cart, if not create one
    const userId = req.session.userId;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the product is already in the cart, if yes, update the quantity
    const existingCartItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    req.flash("success", "Product added to cart successfully");
    res.redirect("/products");
  } catch (error) {
    next(error);
  }
});

// Handle Likes
router.get("/:id/like", auth.isLoggedIn, function (req, res, next) {
  Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then((updatedProduct) => {
      res.render("productDetails", { product: updatedProduct });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
