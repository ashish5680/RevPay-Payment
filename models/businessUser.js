const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// BusinessUser Schema
const userSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },

    qtyOfAccounts: {
        type: Number,
        min: 0
    },

    accounts: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }]    

});


userSchema.plugin(passportLocalMongoose);

const BusinessUser = mongoose.model('BusinessUser', userSchema);

module.exports = BusinessUser;