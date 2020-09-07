const express = require('express');
const router = express.Router();
const paytmController = require('../paytm/paytmController');

router.post('/paynow', paytmController.paytm);
router.post('/callback', paytmController.callback);


module.exports = router;
