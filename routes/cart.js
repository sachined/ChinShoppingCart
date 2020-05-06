/* This is what the customers will see (non-admin zone)
*
* This cart will carry products that a customer gets before purchasing
*
*/
var express = require('express');
var router = express.Router();

// Get Page model
var Product = require('../models/product');

/*
* GET add product to cart
*/
router.get('/add/:product', (req, res) =>  {

  var slug = req.params.product;

  Product.findOne({slug: slug}, (err, p)  =>  {
    if (err)  console.log(err);

    if (typeof req.session.cart == "undefined") {
        req.session.cart = [];
        req.session.cart.push({
            title: slug,
            qty: 1,
            price: parseFloat(p.price).toFixed(2),
            image: '/product_images/'  + p._id + '/' + p.image
        });
    } else {
        var cart = req.session.cart;
        var newItem = true;

        for (i = 0; i < cart.length; i++) {
            if (cart[i].title == slug)  {
                cart[i].qty++;
                newItem = false;
                break;
            }
        }

        if (newItem)  {
            cart.push({
              title: slug,
              qty: 1,
              price: parseFloat(p.price).toFixed(2),
              image: '/product_images/'  + p._id + '/' + p.image
            });
        }
    }

    console.log(req.session.cart);
    req.flash('success', 'Product added!');
    res.redirect('back');
  });
});

/*
* GET checkout page
*/
router.get('/checkout', (req, res) =>  {

    res.render('checkout',  {
        title: 'Checkout',
        cart: req.session.cart
    });

});

// Exports
module.exports = router;
