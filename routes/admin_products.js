/*  This file is for admin section, so it should only be visible to
*   admins, not customers, regarding product management.
*
*  NOTE:
*  req.flash isn't working properly (a bug that will take awhile to figure out)
*  Everything is working even if it doesn't seem like it
*  Sachin 5/2/20
*/
var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category')

/*
* GET products index
*/
router.get('/', (req, res) =>  {
    var count;

    Product.countDocuments((err, c)  =>  {
        count = c;
    });

    Product.find((err, products)  =>  {
        res.render('admin/products', {
          products: products,
          count: count
        });
    });
});

/*
* GET add product
*/
router.get('/add-product', (req, res) => {
    var title = "";
    var desc = "";
    var price = "";

    Category.find((err, categories) =>  {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });

});

/*
* POST add product
*/
router.post('/add-product', function (req, res) {

    let imageFile; //
    if(!req.files)  imageFile="";
    else {
      imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image!').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find((err, categories) =>  {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug}, (err, product) => {
            if (product) {
                // This statement doesn't work or is not showing up when I tried to put an existing slug
                req.flash('danger', 'Product title exists, choose another.');
                Category.find((err, categories) =>  {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                  title: title,
                  slug: slug,
                  desc: desc,
                  price: price2,
                  category: category,
                  image: imageFile
                });

                product.save((err) =>  {
                  if (err)  return console.log(err);

                  mkdirp('public/product_images/'+ product._id, (err)  =>  {
                      return console.log(err);
                  });

                  mkdirp('public/product_images/'+ product._id + '/gallery', (err)  =>  {
                      return console.log(err);
                  });

                  mkdirp('public/product_images/'+ product._id + '/gallery/thumbs', (err)  =>  {
                      return console.log(err);
                  });

                  if (imageFile != "") {
                      var productImage = req.files.image;
                      var path = 'public/product_images/' + product._id + '/' + imageFile;

                      productImage.mv(path, (err) =>  {
                          return console.log(err);
                      });
                  }

                  // This doesn't work when page is added...but the page is added...
                  req.flash('success', 'Product added!');
                  res.redirect('/admin/products');
                });
            }
        });
    }
});

/*
* POST reorder-pages
*/
router.post('/reorder-pages', (req, res) =>  {
    var ids = req.body['id[]'];

    var count = 0;

    for (var i = 0; i < ids.length; i++)  {
      var id = ids[i];
      count++;

      // Because nodeJS is asynchrous, the following function will enable
      // actual sorting and keeps the order even after refreshing

      ((count) => {
      Page.findById(id, (err, page) =>  {
          page.sorting = count;
          page.save((err) =>  {
            if(err) return console.log(err);
          });
      });
      // Random note, synchronous (like PHP or C#) will recognize the above function
      // and allow actual sorting
      })(count);
      // Function within a function allows actual sorting (nodeJS)
    }
});

/*
* GET edit page
*/
router.get('/edit-page/:id', (req, res) => {

    Page.findById(req.params.id, (err, page) =>  {
        if (err)  return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

/*
* POST edit page
*/
router.post('/edit-page/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == "")  slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });

  } else {
      Page.findOne({ slug: slug, _id: {'$ne': id}}, (err, page) => {
          if (page) {
              // For some reason, this message does not appear
              // Included connect-flash-plus, but nothing... (5/2/20)
              // Removed connect-flash-plus, but kept on in case
              req.flash('danger', 'Page slug exists, choose another.');
              res.render('admin/edit_page', {
                  title: title,
                  slug: slug,
                  content: content,
                  id: id
              });
          } else {
              Page.findById(id, (err, page) =>  {
                  if (err)  return console.log(err);

                  page.title = title;
                  page.slug = slug;
                  page.content = content;

                page.save((err) =>  {
                    if (err)  return console.log(err);
                    // For some reason, this message does not appear
                    req.flash('success', 'Page Edited!');
                    res.redirect('/admin/pages/edit-page/'+ id);
                });
              });
            }
        });
    }
});

/*
* GET delete page
*/
router.get('/delete-page/:id', (req, res) =>  {
  Page.findOneAndRemove({ _id: req.params.id }, (err) =>  {
    if (err)  return console.log(err);
    // For some reason, this message does not appear
    req.flash('success', 'Page deleted!');
    res.redirect('/admin/pages/');
  });
});

// Exports
module.exports = router;
