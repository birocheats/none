const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    status: {
      type: String
    },
    isComplete: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    tx_Data: {
      TXN_AMOUNT: { type: String, default: "" },
      MID: { type: String, default: "" },
      WEBSITE: { type: String, default: "" },
      CHANNEL_ID: { type: String, default: "" },
      INDUSTRY_TYPE_ID: { type: String, default: "" },
      ORDER_ID: { type: String, default: "" },
      CUST_ID: { type: String, default: "" },
      CALLBACK_URL: { type: String, default: "" },
      EMAIL: { type: String, default: "" },
      MOBILE_NO: { type: String, default: "" }
    },
    error: {
      message: { type: String, default: "error" },
      code: { type: Number, default: 510 }
    },
    _createdOn: {
      type: Date,
      default: Date.now()
    },
    _updatedOn: {
      type: Date,
      default: Date.now()
    }
  },
  { timestams: true }
);

const paymentTransaction = mongoose.model("paymentTxs", paymentTransactionSchema);
module.exports = paymentTransaction;
