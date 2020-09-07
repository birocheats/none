const mongoose = require("mongoose");

const keysTransactionSchema = new mongoose.Schema(
  {
    keys: [
      {
        type: String
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String
    },
    keyType: {
      type: String
    },
    keyTime: {
      type: String,
      default: "- ---"
    },
    totalPrice: {
      type: Number
    },
    quantity: {
      type: Number,
      default: 1
    },
    finalPrice: {
      type: Number
    },
    couponCode: {
      type: String,
      default: null
    },
    couponApplicable: {
      type: Boolean,
      default: false
    },
    _createdOn: {
      type: Date,
      default: Date.now()
    },
    _updatedOn: [
      {
        type: Date,
        default: Date.now()
      }
    ]
  },
  { timestams: true }
);

const keysTransaction = mongoose.model("keysTransaction", keysTransactionSchema);
module.exports = keysTransaction;
