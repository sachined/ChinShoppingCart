/* This is what the customers will see (non-admin zone)
*
* This will connect the products from back-end to front-facing
*
*/
var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
* GET all products
*/
//router.get('/', isUser, (req, res) =>  {
router.get('/', (req, res) =>  {

  Product.find((err, products)  =>  {
    if (err)  console.log(err);

    res.render('all_products', {
      title: 'All products',
      products: products
    });
  });
});

/*
* GET products by category
*/
router.get('/:category', (req, res) =>  {

    var categorySlug  = req.params.category;

    Category.findOne({slug: categorySlug}, (err, c) =>  {
        Product.find({category: categorySlug}, (err, products)  =>  {
          if (err)  console.log(err);

          res.render('cat_products', {
            title: c.title,
            products: products
          });

        });
    });
});

/*
* GET product details
*/
router.get('/:category/:product', (req, res) =>  {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated())  ? true : false;

    Product.findOne({slug: req.params.product}, (err, product) => {
        if (err)  console.log(err);
        else {
          var galleryDir = 'public/product_images/' + product._id + '/gallery';

          fs.readdir(galleryDir, (err, files) =>  {
            if (err) console.log(err);
            else {
              galleryImages = files;

              res.render('product', {
                  title: product.title,
                  p: product,
                  galleryImages: galleryImages,
                  loggedIn: loggedIn
              });
            }
          });

        }
    });
});


// Exports
module.exports = router;
