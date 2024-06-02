const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Account Schema
const accountSchema = new mongoose.Schema({

    accountIdentifier: { 
        type: String,
        default: uuidv4, 
        required: true, 
        unique: true 
    },
  
    businessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BusinessUser', 
        required: true 
    },

    accountNumber: {
        type: Number,
        required: true,
        unique: true,
        min: 1000000000,
        max: 9999999999,
    },

    sortCode: {
        type: Number,
        required: true,
        min: 10000000,
        max: 99999999,
    },

    activationStatus: { 
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE' 
    },

    allowCredit: {
        type: Boolean,
        default: true
    },
      
    allowDebit: {
        type: Boolean,
        default: true
    },
  
    dailyWithdrawalLimit: { 
        type: Number, 
        default: 100000 
    },
  
    balance: { 
        type: Number, 
        default: 2000
    },
    
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }]

});


const Account = mongoose.model('Account', accountSchema);

module.exports = Account;