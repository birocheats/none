const Keys = require("../models/sharpshooterkeys");
const ssgKeys = require("../models/SharpShooterGlobalkey");
const GoCheatKeys = require("../models/goCheatKey");
const InceptionKeys = require("../models/inceptionKey");
const User = require("../models/user");
const cc = require("coupon-code");
const Coupon = require("../models/couponPrice");
/**
 * @description Wrapper to add keys into desired DB & send user back
 *
 * @param {MongoDB} keysDB > DB instance
 */
const insertKeysIntoDB = (keysDB) => async (req, res) => {
  let message = void 0;
  try {
    message = `Keys added successfully::::::::::::::::::::::::`;
    let { keyNumber, price, keyTime } = req.body || {};
    // console.log("keyNumber>>>>", keyNumber);
    keyNumber = ("" + keyNumber).replace(/\r\n/gi, " ").split(" ");
    // console.log(keyNumber, "keyNumber>>>>");
    for (let key in keyNumber) {
      try {
        if (keyNumber[key].trim()) {
          await keysDB.create({
            keyNumber: ("" + keyNumber[key]).trim(),
            price: price || 0,
            keyTime: keyTime || 1
          });
          message += `::::::::::: ${keyNumber[key].trim()} added`;
        }
      } catch (err) {
        // console.error("error in add key", err);
        message += `::::::::::: ${keyNumber[key].trim()} not added`;
      }
    }
  } catch (err) {
    message = "Unable to add some/all key";
  }
  return res.send(`<script>alert("${message}");window.history.back();</script>`);
};

/**
 * @description Wrapper for auth user & render desire page, otherwise send back
 *
 * @param {String} name > ejs page name
 * @param {Object} data > data to be send, if any
 */
const wrapperForPageRender = (name, data) => async (req, res) => {
  try {
    User.findOne(req.user, function (err, user) {
      if (!err && user.isActive) {
        return res.render(name, data);
      } else {
        return res.redirect("back");
      }
    });
  } catch (err) {
    return res.redirect("back");
  }
};

//adminPage
module.exports.adminPage = wrapperForPageRender("adminPage", {
  title: "BiroCheats || AdminPage"
});

//sharp
module.exports.sharpPage = wrapperForPageRender("sharp", {
  title: "BiroCheats || AdminPage"
});
//sharp keys
module.exports.sharp = insertKeysIntoDB(Keys);

//SharpShooterGlobal
module.exports.ssgPage = wrapperForPageRender("ssg", { title: "BiroCheats || AdminPage" });
//SharpShooterGlobal keys
module.exports.ssg = insertKeysIntoDB(ssgKeys);

//gocheat
module.exports.goPage = wrapperForPageRender("go", { title: "BiroCheats || AdminPage" });
//gocheat keys
module.exports.go = insertKeysIntoDB(GoCheatKeys);

//inception
module.exports.inceptionPage = wrapperForPageRender("incep", {
  title: "BiroCheats || AdminPage"
});
//inception keys
module.exports.inception = insertKeysIntoDB(InceptionKeys);

module.exports.userAdminPage = async (req, res) => {
  try {
    let admin = await User.findOne({ isActive: true }).lean();
    if (admin) {
      let updatedUser = await User.findOne({});
    }
  } catch (error) {
    console.log(error);
    return res.redirect("back");
  }
};

module.exports.authUser = async (req, resp, next) => {
  try {
    if (req.user && ("" + req.user).trim()) {
      User.findOne(req.user, function (err, user = {}) {
        if (user.isActive) {
          next();
        } else {
          return resp.sendStatus(404);
        }
      });
    } else {
      return resp.sendStatus(404);
    }
  } catch (err) {
    return resp.sendStatus(510);
  }
};

module.exports.addBalance = async (req, res) => {
  let currBalance = await User.findOneAndUpdate(
    { email: req.body.email },
    { $inc: { money: req.body.money } }
  );
  if (currBalance) {
    res.send(`<script>alert("Balance Added Succefully");window.history.back();</script>`);
  } else {
    res.send(`<script>alert("Please Check Email");window.history.back();</script>`);
  }
};

module.exports.renderAddPage = async (req, res) => {
  return res.render("addBalance", {
    title: "Add Balance"
  });
};

module.exports.couponHandler = async (req, res) => {
  let coupon = await Coupon.create({ coupon: cc.generate(), value: req.body.value });
  if (coupon) {
    return res.redirect("back");
  }
};

module.exports.coupon = (req, res) => {
  return res.render("coupon", {
    title: "Generate Coupons"
  });
};
