const mongoose = require("mongoose");

const coupons_schema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    sharpShooter: {
      "1Day": { type: Number, default: 0 },
      "7Day": { type: Number, default: 0 },
      "30Day": { type: Number, default: 0 },
    },
    go: {
      "1Day": { type: Number, default: 0 },
      "7Day": { type: Number, default: 0 },
      "30Day": { type: Number, default: 0 },
    },
    inception: {
      "1Day": { type: Number, default: 0 },
      "7Day": { type: Number, default: 0 },
      "30Day": { type: Number, default: 0 },
    },
    SharpShooterGlobal: {
      "1Day": { type: Number, default: 0 },
      "7Day": { type: Number, default: 0 },
      "30Day": { type: Number, default: 0 },
    },
  },
  { timestams: true }
);

const coupons = mongoose.model("couponData", coupons_schema);
module.exports = coupons;
