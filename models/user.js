var mongoose = require('mongoose');
/*
* This Schema create a Page (view page for a store)

* Ex: About Us (about-us) -> This page describes the store and its owners/employees
*     Services (services) -> Describe the services that this store/business offers
*     Contact Us (contact-us) -> How people can contanct you about any issues or products
*/
// Page Schema
var PageSchema = mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  sorting: {
    type: Number
  }
});

var Page = module.exports = mongoose.model('Page', PageSchema);
