var mongoose = require('mongoose');
/*
* This Schema create a Page (view page for a store)

* Ex: About Us (about-us) -> This page describes the store and its owners/employees
*     Services (services) -> Describe the services that this store/business offers
*     Contact Us (contact-us) -> How people can contanct you about any issues or products
*/
// User Schema
var UserSchema = mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Number
  }
});

var User = module.exports = mongoose.model('User', UserSchema);
