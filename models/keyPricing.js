const mongoose = require("mongoose");

const keySchema = new mongoose.Schema(
  {
    keyPricing: {
      sharpShooter: {
        "1Day": { type: Number },
        "7Day": { type: Number },
        "30Day": { type: Number }
      },
      go: {
        "1Day": { type: Number },
        "7Day": { type: Number },
        "30Day": { type: Number }
      },
      inception: {
        "1Day": { type: Number },
        "7Day": { type: Number },
        "30Day": { type: Number }
      },
      SharpShooterGlobal: {
        "1Day": { type: Number },
        "7Day": { type: Number },
        "30Day": { type: Number }
      }
    }
  },
  { timestams: true }
);

const keysPricing = mongoose.model("keysPricing", keySchema);
module.exports = keysPricing;
