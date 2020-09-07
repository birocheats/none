const Keys = require("../models/sharpshooterkeys");
const GoCheatKeys = require("../models/goCheatKey");
const InceptionKeys = require("../models/inceptionKey");
const SharpShooterGlobalKeys = require("../models/SharpShooterGlobalkey");
const keysTransaction = require("../models/keysTransaction");
const User = require("../models/user");
const dateFormat = require("dateformat");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// revertAllBuyedKeys = async () => {
//   let allkey = await Keys.find({ isActive: false });
//   console.log(allkey.length, "<><<>><<><>>><<");
//   for (let key of allkey) {
//     console.log("updating", key.id);
//     await Keys.findByIdAndUpdate(ObjectId(key.id), { $set: { isActive: true, user: [] } });
//   }
//   console.log("keys updated");
// };
// revertAllBuyedKeys();
// change name here!!!
const nameMapping = {
  sharp: "SHARPSHOOTER",
  go: "GO-CHEAT",
  inception: "INCEPTION",
  SharpShooterGlobal: "SHARPSHOOTER GLOBAL"
};

const checkoutWrapper = ({ db, name }) => async (req, res) => {
  let initialBuyKeys = void 0;
  try {
    if (!req.isAuthenticated()) {
      res.redirect("/");
      return;
    }
    let { user } = req || {};
    let transactionData = await keysTransaction.findOne({ user, status: "pending", keyType: nameMapping[name] });
    if (!transactionData || !transactionData.keys.length) {
      // NO CURRENT TRANSACTION FOUND
      res.render("orders", { title: "BiroCheats || orders", keys: user.purchaseHistory });
      return;
    }
    const { _id: transactionId, keys = [], finalPrice, keyTime } = transactionData || {};
    initialBuyKeys = keys;
    let now = new Date();
    for (let singleKey of keys) {
      // update into user & remove key
      await db.findOneAndDelete({ keyNumber: singleKey });
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $push: {
            purchaseHistory: {
              $each: [
                `${dateFormat(now, "mmmm dS, yyyy, h:MM:ss TT")}=> ${nameMapping[name]}:${keyTime}:==KEY=> ${singleKey}`
              ],
              $position: 0
            }
          }
        }
      );
    }
    await User.findOneAndUpdate({ email: user.email }, { $inc: { money: -finalPrice } });
    await keysTransaction.findByIdAndUpdate(ObjectId(transactionId), { $set: { status: "done" } });
    res.redirect("/orders");
    // res.render("continue", { title: "purchase Completed" });
    return;
  } catch (error) {
    console.log("error raised", error, "<<<<<<");
    if (initialBuyKeys) {
      for (let key of initialBuyKeys) {
        await db.findOneAndUpdate({ keyNumber: key }, { $set: { isActive: true, user: [] } });
      }
    }
    await keysTransaction.findOneAndUpdate(
      { user, status: "pending", keyType: nameMapping[name] },
      { status: "errorInCheckout" }
    );
    return res.redirect("back");
  }
};

module.exports.sharpOrder = checkoutWrapper({ db: Keys, name: "sharp" });
module.exports.inceptionOrder = checkoutWrapper({ db: InceptionKeys, name: "inception" });
module.exports.SharpShooterGlobalOrder = checkoutWrapper({ db: SharpShooterGlobalKeys, name: "SharpShooterGlobal" });
module.exports.goCheatOrder = checkoutWrapper({ db: GoCheatKeys, name: "go" });

module.exports.order = (req, res) => {
  return res.render("orders", {
    title: "Orders"
  });
};
