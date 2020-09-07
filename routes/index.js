const express = require("express");
const router = express.Router();
const basic_auth_router_ = express.Router();
const admin_auth_router_ = express.Router();
const indexRouter = require("../controllers/indexController");
const keyHandler = require("../controllers/keyHandlerController");
const orderController = require("../controllers/orderController");
const renderString =
  "<html><body><script>alert('PLEASE LOGIN TO CONTINUE');window.location.href='/';</script></body></html>";
const adminAuth = (rq, rs, nxt) =>
  rq.user && rq.user.isActive ? nxt() : rs.sendStatus(401);
const basicAuth = (rq, rs, nxt) => (rq.user ? nxt() : rs.send(renderString));

/* GET home page. */
router.get("/", indexRouter.home);
//common
basic_auth_router_.get("/wallet", indexRouter.wallet);
basic_auth_router_.get("/shop", indexRouter.index);

// this is cart
basic_auth_router_.get("/paymentConformation", indexRouter.paymentConformation);
basic_auth_router_.get("/cancleCurrentOrder", indexRouter.cancleCurrentOrder);

//shop page render
basic_auth_router_.get("/shop/sharpshooter", indexRouter.buyShooter); //order place
basic_auth_router_.get("/shop/SharpShooterGlobal", indexRouter.buySharpShooterGlobal);
basic_auth_router_.get("/shop/go-cheat", indexRouter.buyGoCheat);
basic_auth_router_.get("/shop/inception", indexRouter.buyInception);

//shop handlers
basic_auth_router_.post("/shop/sharpshooter/purchase", keyHandler.sharpHandler); // order confirm
basic_auth_router_.post("/shop/go-cheat/purchase", keyHandler.goCheatHandler);
basic_auth_router_.post("/shop/SharpShooterGlobal/purchase", keyHandler.SharpShooterGlobalHandler);
basic_auth_router_.post("/shop/inception/purchase", keyHandler.inceptionHandler);

//order:
basic_auth_router_.get("/orders", orderController.order);
basic_auth_router_.get("/continue", orderController.sharpOrder); // get payment& finalize
basic_auth_router_.get("/in-continue", orderController.inceptionOrder);
basic_auth_router_.get("/ssg-continue", orderController.SharpShooterGlobalOrder);
basic_auth_router_.get("/go-continue", orderController.goCheatOrder);

// ADMIN ROUTES
admin_auth_router_.use("/", require("./keys"));

router.use("/", require("./paytm"));
router.use("/users", require("./users"));
router.use("/", basicAuth, basic_auth_router_);
router.use("/", adminAuth, admin_auth_router_);
module.exports = router;
