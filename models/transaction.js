const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAWAL'],
        required: true
    },
    beneficiaryAccountNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },

    beneficiarySortCode: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;