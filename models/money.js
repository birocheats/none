const mongoose = require('mongoose');

const moneySchema = new mongoose.Schema({
    availableBalance: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestams: true
});

const Money = mongoose.model('Money', moneySchema);
module.exports = Money;