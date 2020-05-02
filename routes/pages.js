/* This is what the customers will see (non-admin zone)
*
* Think storefront and aisles of a store
*
*/

var express = require('express');
var router = express.Router();

router.get('/', (req, res) =>  {
  res.render('index', {
    title: 'Home'
  });
});

// Exports
module.exports = router;
