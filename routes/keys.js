const express = require("express");
const router = express.Router();
const adminPage = require("../controllers/adminPage");

/* GET users listing. */
//list
router.get("/adminPage", adminPage.adminPage);
router.get("/adminPage/balance", adminPage.renderAddPage);
router.post("/adminPage/balance/add", adminPage.addBalance);
//sharp
router.get("/adminPage/sharp", adminPage.sharpPage);
router.post("/adminpage/sharp/post", adminPage.sharp);

//sharpshooter global
router.get("/adminPage/ssg", adminPage.ssgPage);
router.post("/adminpage/ssg/post", adminPage.ssg);

//gocheat
router.get("/adminPage/go", adminPage.goPage);
router.post("/adminpage/go/post", adminPage.go);

//inception
router.get("/adminPage/inception", adminPage.inceptionPage);
router.post("/adminpage/inception/post", adminPage.inception);

module.exports = router;
