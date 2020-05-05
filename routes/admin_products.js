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
//var mkdirp = require('mkdirp');
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

                  fs.mkdir('public/product_images/'+ product._id, (err)  =>  {
                      if(err) console.log(err);
                      else console.log('This file has been saved!!');
                  });

                  fs.mkdir('public/product_images/'+ product._id + '/gallery', (err)  =>  {
                    if(err) console.log(err);
                    else console.log('This file has been saved 2!!');
                  });

                  fs.mkdir('public/product_images/'+ product._id + '/gallery/thumbs', (err)  =>  {
                    if(err) console.log(err);
                    else console.log('This file has been saved 3!!');
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
* GET edit product
*/
router.get('/edit-product/:id', (req, res) => {

    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find((err, categories) =>  {

        Product.findById(req.params.id, (err, p) => {
            if (err)  {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) =>  {
                    if (err) console.log(err);
                    else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: p.price,
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});

/*
* POST edit product
*/
router.post('/edit-product/:id', (req, res) => {

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
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' +id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, (err, p) =>  {
            if (err)  console.log(err);

            if (p)  {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, p) =>  {
                    if (err) console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "")  {
                        p.image = imageFile;
                    }

                    p.save((err)  => {
                        if (err) console.log(err);

                        if (imageFile != "")  {
                            if (pimage != "")  {
                                fs.remove('public/product_images/' + id + '/' + pimage, (err) =>  {
                                    if (err)  console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, (err) =>  {
                                return console.log(err);
                            });
                        }
                        // This doesn't work when page is added...but the page is added...
                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

/*
* POST product gallery
*/
router.post('/product-gallery/:id', (req, res) =>  {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) => {
        if (err)  console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then((buf)  =>  {
            fs.writeFileSync(thumbsPath, buf);
        });

    });

    res.sendStatus(200);

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
