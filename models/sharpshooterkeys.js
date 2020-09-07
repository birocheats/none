const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    keyNumber: {
        type: String,
        unique: true
    },
    keyTime: {
        type: Number,
        default: 0
    },
    AddedDate: {
        type: Date,
        default: Date.now()
    },
    isActive: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, {
    timestams: true
});


const sharpshooter = mongoose.model('ss regional ', keySchema);
module.exports = sharpshooter;