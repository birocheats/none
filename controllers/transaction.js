const Transaction = require("../models/paymentTransaction");
const dateFormat = require("dateformat");
const mongoose = require("mongoose");
const User = require("../models/user");
const ObjectId = mongoose.Types.ObjectId;

module.exports.transaction = async (req, res) => {
  let { search = "" } = req.query || {};
  search = (search + "").trim();
  let defaultSearchData = search;
  let query = {};
  if (search) {
    try {
      let result = await User.findOne({ email: search }, { _id: 1 });
      search = (result && result._id) || false;
      if (search) {
        query = { user: ObjectId(search) };
      }
    } catch (err) {}
  }
  await Transaction.find(query, null, { sort: { _updatedOn: -1 } }, (err, data) => {
    if (err) {
      console.log(">>12462376ERROR:Error:", err);
      data = [];
    }
    let amount = {};
    data = data.map(e => {
      const tx_amount = Number(e.tx_Data.TXN_AMOUNT) || 0;
      if (e.isError) {
        amount["error"] = (amount["error"] || 0) + tx_amount;
      } else {
        let field = "pending";
        if (e.isComplete) {
          field = "complete";
        }
        amount[field] = (amount[field] || 0) + tx_amount;
      }
      let time = dateFormat(e._updatedOn, "mmm dS, yyyy, h:MM:ss TT");
      return {
        time: time,
        status: e.status,
        isComplete: e.isComplete,
        tx_Data: { TXN_AMOUNT: e.tx_Data.TXN_AMOUNT, EMAIL: e.tx_Data.EMAIL }
      };
    });
    return res.render("transaction", {
      title: "BiroCheats || trans",
      data_: data,
      amount_: amount,
      search: defaultSearchData
    });
  });
};
