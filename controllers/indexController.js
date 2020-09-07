const User = require("../models/user");
const keyPricing = require("../models/keyPricing");
const keysTransaction = require("../models/keysTransaction");
// const Money = require('../models/money');
// change name here !!
let dbNameMapping = {
  "sharpshooter": "sharpShooter",
  inception: "inception",
  "SharpShooter Global": "SharpShooterGlobal",
  "go cheat": "go"
};

const mapName = (name) => dbNameMapping[name] || name;
const getPageToRender = ({
  redirectTo,
  name: hackName,
  pageToRender = "purchasePage_all",
  dataToRender = ""
}) => async (req, res) => {
  let pricing = void 0;
  if (pageToRender === "purchasePage_all") {
    pricing = await keyPricing.aggregate([
      { $project: { pricing: "$keyPricing." + mapName(hackName) } }
    ]);
    pricing = pricing && pricing[0] && pricing[0].pricing;
  }
  console.log(pricing);
  if (req.isAuthenticated()) {
    return res.render(pageToRender, {
      title: "BiroCheats || " + hackName,
      pricing,
      pageName: hackName,
      redirectTo,
      dataToRender
    });
  } else {
    return res.redirect("/users/login");
  }
};

module.exports.home = (req, res) => res.render("index", { title: "BiroCheats || Home" });

module.exports.index = getPageToRender({ name: "Shop", pageToRender: "home" });

module.exports.buyShooter = getPageToRender({
  name: "sharpshooter",
  redirectTo: "sharpshooter"
});

module.exports.buyInception = getPageToRender({
  name: "inception",
  redirectTo: "inception"
});

module.exports.buySharpShooterGlobal = getPageToRender({
  name: "SharpShooter Global",
  redirectTo: "SharpShooterGlobal"
});

module.exports.buyGoCheat = getPageToRender({ name: "go cheat", redirectTo: "go-cheat" });

module.exports.wallet = async (req, res) => {
  await User.findOne({ money: req.user.money }, function (err, money) {
    return res.render("wallet", {
      title: "BiroCheats || Wallet",
      money: money
    });
  });
};

module.exports.paymentConformation = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.redirect("/");
    }
    let transactionData = await keysTransaction.findOne({
      user: req.user,
      status: "pending"
    });
    console.log(">>>tX>>>", transactionData);
    if (!transactionData || !transactionData.keys.length) {
      if (transactionData) {
        await keysTransaction.findOneAndUpdate(
          { user: req.user, status: "pending" },
          { status: "zero keys error" }
        );
      }
      // NO CURRENT TRANSACTION FOUND

      res.render("paymentConfirmation", { nodata: true });
      return;
    }
    let hackName = transactionData["keyType"];
    // change name here!!!
    const mapPageTODb = {
      "SHARPSHOOTER": "/continue",
      "GO-CHEAT": "/go-continue",
      INCEPTION: "/in-continue",
      "SHARPSHOOTER GLOBAL": "/ssg-continue"
    };
    hackName = mapPageTODb[hackName];
    console.log(">>hackanme>>", hackName);
    let dataToRender = {
      title: "BiroCheats || Payment Conformation",
      onSuccess: hackName,
      onCancel: "/cancelOrder",
      _id: "okokok",
      ...transactionData._doc,
      keys: [],
      user: req.user,
      nodata: false
    };
    res.render("paymentConfirmation", dataToRender);
  } catch (err) {
    console.log(err, "err");
    res.redirect("back");
  }
};
module.exports.cancleCurrentOrder = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.redirect("/");
    }
    await keysTransaction.findOneAndUpdate(
      { user: req.user, status: "pending" },
      {
        $set: { status: "canceled" },
        $push: { _updatedOn: { $each: [new Date()], $position: 0 } }
      }
    );
    res.redirect("/orders");
  } catch (err) {
    res.redirect("back");
  }
};
