const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    isActive: {
        type: Boolean,
        default: false
    },
    money: {
        type: Number,
        default: 0
    },
    purchaseHistory: [{
        type: String
    }]
}, {
    timestams: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;