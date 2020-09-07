const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const passport = require('passport');

const transaction = require('../controllers/transaction');
const keystransaction = require('../controllers/keystransaction');

const adminAuth = (rq, rs, nxt) =>
  rq.user && rq.user.isActive ? nxt() : rs.sendStatus(401);
const basicAuth = (rq, rs, nxt) => (rq.user ? nxt() : rs.send(renderString));
/* GET users listing. */
router.post('/create', authenticationController.create);
router.get('/register', authenticationController.signup);

router.post('/create-session', passport.authenticate('local', {
  failureRedirect: '/users/login'
}), authenticationController.createSession);
router.get('/sign-out', authenticationController.destroySession);
router.get('/login', authenticationController.login);
router.get('/transaction', adminAuth,transaction.transaction);
router.get('/keystransaction', adminAuth,keystransaction.keystransaction);

module.exports = router;
