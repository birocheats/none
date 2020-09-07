const Keys = require("../models/sharpshooterkeys");
const GoCheatKeys = require("../models/goCheatKey");
const InceptionKeys = require("../models/inceptionKey");
const SharpShooterGlobalKeys = require("../models/SharpShooterGlobalkey");
const keysPricing = require("../models/keyPricing");
const keysTransaction = require("../models/keysTransaction");
const couponCodedb = require("../models/couponPrice");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// change name here!!!
const nameMapping = {
  sharp: "SHARPSHOOTER",
  go: "GO-CHEAT",
  inception: "INCEPTION",
  SharpShooterGlobal: "SHARPSHOOTER GLOBAL"
};
const keyPricing_coupon_Mapping = {
  sharp: "sharpShooter",
  inception: "inception",
  go: "go",
  SharpShooterGlobal: "SharpShooterGlobal",
  1: "1Day",
  7: "7Day",
  30: "30Day"
};
console.log(">>>pricing");

// keysPricing
//   .aggregate([
//     { $limit: 1 },
//     {
//       $project: {
//         price: "$keyPricing.go",
//       },
//     },
//   ])
//   .then(console.log)
//   .catch(console.warn);
const buyKeyWrapper = ({ db, onSuccess, name: hackName }) => async (req, res) => {
  let initialKeys = [];
  let transactionData = {};
  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }
    let { user = {}, body: { keyTime, quantity, couponCode } = {} } = req || {};
    let { money = -1 } = user || {};
    money = Number(money) || -1;
    quantity = Number(quantity);
    quantity = quantity > 1 ? quantity : 1;
    transactionData["keyTime"] = keyTime + " Day";
    transactionData["keyType"] = nameMapping[hackName];
    transactionData["couponCode"] = couponCode.trim() || null;
    transactionData["quantity"] = quantity;
    transactionData["user"] = user;
    initialKeys = await db.find({ keyTime: keyTime, isActive: true }, null, {
      limit: quantity
    });
    if (!initialKeys || !initialKeys.length) {
      return res.render("out of stock", {});
    }
    if (quantity !== initialKeys.length) {
      // less keys available
      return res.render("out of stock", { keyLeft: initialKeys.length });
    }
    // we have required keys available
    // find price of key
    let key_price = await keysPricing.aggregate([
      { $limit: 1 },
      {
        $project: {
          price: `$keyPricing.${keyPricing_coupon_Mapping[hackName]}.${keyPricing_coupon_Mapping[keyTime]}`
        }
      }
    ]);
    key_price = key_price && key_price[0] && key_price[0].price;
    console.log("key_price>>", key_price);
    // unset isActive in all keys
    for (let key of initialKeys) {
      await db.findByIdAndUpdate(ObjectId(key._id), { $set: { isActive: false, user } }, { new: true });
    }
    const keysMapping = initialKeys.reduce(
      (state, key) => {
        state.keys.push(key.keyNumber);
        state.totalPrice += key_price || 0;
        return state;
      },
      { keys: [], totalPrice: 0 }
    );
    // validate Coupon, when required
    let discountOffered = 0;
    // TODO: add coupon code here
    let cp = await couponCodedb.findOne({
      code: transactionData["couponCode"],
      isExpired: false
    });
    if (cp) {
      // get name
      cp = cp[keyPricing_coupon_Mapping[hackName]] || {};
      // get price
      discountOffered = cp[keyPricing_coupon_Mapping[keyTime]] || 0;
    }
    transactionData["couponApplicable"] = discountOffered != 0;

    let totalDiscount = discountOffered * quantity;
    // effective price
    keysMapping["finalPrice"] =
      keysMapping.totalPrice / 2 > totalDiscount ? keysMapping.totalPrice - totalDiscount : keysMapping.totalPrice;
    if (money >= 0 && money >= keysMapping.finalPrice) {
      transactionData = { ...transactionData, ...keysMapping };
      transactionData["status"] = "pending";
      transactionData["_updatedOn"] = [new Date()];
      await keysTransaction.create(transactionData);
      res.redirect("/paymentConformation");
      return;
    } else {
      // set isActive in all buyed keys
      for (let key of initialKeys) {
        await db.findByIdAndUpdate(ObjectId(key._id), { $set: { isActive: true, user: [] } }, { new: true });
      }
      return res.render("Insufficent Balance", {});
    }
  } catch (error) {
    console.log(error, "error in buy>>>");
    if (initialKeys.length) {
      for (let key of initialKeys) {
        await db.findByIdAndUpdate(ObjectId(key._id), { $set: { isActive: true, user: [] } }, { new: true });
      }
    }
    return res.redirect("back");
  }
};

module.exports.sharpHandler = buyKeyWrapper({
  db: Keys,
  onSuccess: "/continue",
  name: "sharp"
});

module.exports.inceptionHandler = buyKeyWrapper({
  db: InceptionKeys,
  onSuccess: "/in-continue",
  name: "inception"
});

module.exports.goCheatHandler = buyKeyWrapper({
  db: GoCheatKeys,
  onSuccess: "/go-continue",
  name: "go"
});

module.exports.SharpShooterGlobalHandler = buyKeyWrapper({
  db: SharpShooterGlobalKeys,
  onSuccess: "/ssg-continue",
  name: "SharpShooterGlobal"
});
