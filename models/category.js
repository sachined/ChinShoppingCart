var mongoose = require('mongoose');
/*
* This Schema create a Category (type of items)
*
* Ex: Food (food) -> Bananas, Jerky, etc.
*     Drink (drink) -> Shake, Water, etc.
*     Computer Goods (computer-goods) -> Mouse, Keyboard, etc.
*/
// Category Schema
var CategorySchema = mongoose.Schema({

  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  }
});

var Category = module.exports = mongoose.model('Category', CategorySchema);
