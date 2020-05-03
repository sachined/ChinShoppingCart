var mongoose = require('mongoose');
/*
* This Schema create a Product

* Ex: About Us (about-us) -> This page describes the store and its owners/employees
*     Services (services) -> Describe the services that this store/business offers
*     Contact Us (contact-us) -> How people can contanct you about any issues or products
*/
// Page Schema
var ProductSchema = mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
});

var Page = module.exports = mongoose.model('Page', PageSchema);
