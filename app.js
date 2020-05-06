var express = require('express')
var path = require('path')
const dotenv = require('dotenv');
var mongoose = require('mongoose')
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');

// This statement might be redundant, but kept in case
//var flash = require('connect-flash-plus');
// Enables usage of environmental variables
dotenv.config();

// Connect to db
// process.env.MONGO_DB can be replaced with a string if not using dotenv
mongoose.connect(
    process.env.MONGO_DB,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
    () => console.log('Connected to MongoDB!')
);

// Initialize app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec((err, pages) => {
    if (err)  console.log(err);
    else {
      app.locals.pages = pages;
    }
});

// Get Category model
var Category = require('./models/category');

// Get all pages to pass to header.ejs
Category.find((err, categories) => {
    if (err)  console.log(err);
    else {
      app.locals.categories = categories;
    }
});



// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true }
}));

// This might be extra, but leave it in unless it becomes redundant
// Connect-flash-plus middleware
//app.use(flash());

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
      isImage: (value, filename)  =>  {
          var extension = (path.extname(filename)).toLowerCase();
          switch(extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case '.png':
                  return '.png';
              case '':
                  return '.jpg';
              default:
                  return false;
          }
      }
  }
}));

// Express Messages middleware
app.use(require('connect-flash')());

// This will show messages
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// This will enable the cart usage
app.get('*', function (req, res, next)  {
    res.locals.cart = req.session.cart;
    next();
});

// Set routes
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages);

// Start the server
var port = 3000;
app.listen(port, () => {
  console.log('Server running on port ' + port);
});
