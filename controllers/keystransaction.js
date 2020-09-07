const Transaction = require("../models/keysTransaction");
const User = require("../models/user");
const dateFormat = require("dateformat");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const userData = require("../config/reduxData").userData;
const maxItem = 15;
module.exports.keystransaction = async (req, res) => {
  try {
    let { search = "", page = 1 } = req.query || {};
    page = Number(page) || 1;
    page = page > 0 ? page : 1;
    page = page * maxItem;
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
    console.log({ sort: { _createdOn: -1 }, skip: page - maxItem, limit: page });
    let data = await Transaction.find(query, null, { sort: { _createdOn: -1 } })
      .skip(page - maxItem)
      .limit(page); //, skip: page - maxItem, limit: page });
    data = data || [];
    let data_ = [];
    console.log(data.length);
    for (const item of data) {
      let userDetails = item.user;
      try {
        userDetails = await userData(item.user);
        userDetails = userDetails.email;
      } catch (err) {}
      let time = dateFormat(item._createdOn, "mmm dS, yyyy, h:MM:ss TT");
      data_.push({
        keyType: item.keyType,
        keys: item.keys,
        user: userDetails,
        totalPrice: item.totalPrice,
        finalPrice: item.finalPrice,
        couponCode: item.couponCode,
        status: item.status,
        time
      });
    }
    return res.render("keystransaction", {
      title: "BiroCheats || trans",
      data_,
      search: defaultSearchData,
      nextpage: (Number(page / maxItem) || 1) + 1,
      prevpage: (Number(page / maxItem) || 1) - 1
    });
  } catch (err) {
    res.redirect("/");
  }
};
