var express = require('express');
var router = express.Router();

// Get Page model
var Category = require('../models/category');

/*
* GET category index
*/
router.get('/', (req, res) =>  {
    Category.find((err, categories) =>  {
      if (err)  return console.log(err);
      res.render('admin/categories', {
        categories: categories
      });
  });
});
/*
* GET add category
*/
router.get('/add-category', (req, res) => {
  var title = "";

  res.render('admin/add_category', {
    title: title
  });
});

/*
* POST add category
*/
router.post('/add-category', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();

  var errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/add_category', {
      errors: errors,
      title: title,
    });
  } else {
    Category.findOne({ slug: slug}, (err, category) => {
        if (category) {
          req.flash('danger', 'Category title exists, choose another.');
          res.render('admin/add_category', {
            title: title
          });
        } else {
            var category = new Category({
              title: title,
              slug: slug
            });

            category.save((err) =>  {
              if (err)  return console.log(err);

              req.flash('success', 'Category added!');
              res.redirect('/admin/categories');
            });
        }
    });
  }
});

/*
* GET edit category
*/
router.get('/edit-category/:id', (req, res) => {

    Category.findById(ObjectID(req.params.id).str, (err, category) =>  {
        if (err)  return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});

/*
* POST edit page
*/
router.post('/edit-page/:slug', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();
  req.checkBody('content', 'Content must have a value.').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == "")  slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.body.id;

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
              // Included connect-flash-plus, but nothing...
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

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages/edit-page/'+page.slug);
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
  Page.findByIdAndRemove(req.params.id, (err) =>  {
    if (err)  return console.log(err);

    req.flash('success', 'Page deleted!');
    res.redirect('/admin/pages/');
  });
});

// Exports
module.exports = router;
