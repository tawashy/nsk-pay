var express = require('express');
var router = express.Router();

var userController = require('../controller/auth.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  next();
});


router.post('/register', userController.register);
router.post('/login', userController.login);


module.exports = router;
