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

    Category.findById(req.params.id, function (err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});


/*
* POST edit category
*/
router.post('/edit-category/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value.').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    console.log('errors');
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id
    });

  } else {
      Category.findOne({ slug: slug, _id: {'$ne': id}}, (err, category) => {
          if (category) {
              // For some reason, this message does not appear
              // Included connect-flash-plus, but nothing...
              req.flash('danger', 'Category title exists, choose another.');
              res.render('admin/edit_category', {
                  title: title,
                  id: id
              });
          } else {
              Category.findById(id, (err, category) =>  {
                  if (err)  return console.log(err);

                  category.title = title;
                  category.slug = slug;

                category.save((err) =>  {
                    if (err)  return console.log(err);

                    req.flash('success', 'Category edited!');
                    res.redirect('/admin/categories/edit-category/'+ id);
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
