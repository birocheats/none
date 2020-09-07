const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    coupon: {
        type: String
    },
    value: {
        type: Number,
        default: 0
    }
}, {
    timestams: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;