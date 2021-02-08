var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/", async (req, res, next) => {
  try {
    console.log("route test.");
      
    res.status(200).send({ result: true, data: null });
  } catch(err) {
    next(err);
  }
});

module.exports = router;
