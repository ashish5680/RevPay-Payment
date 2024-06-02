const Account = require('../models/account'); 

const verifyAccountOwnership = async (req, res, next) => {
    try {
        const user = req.user;
        const accountId = req.params.id;

        // Fetch the account details from the database
        const foundAccount = await Account.findById(accountId);
        if (!foundAccount) {
            req.flash('error', 'Account not found');
            return res.redirect('/account');
        }

        const account = user.accounts.find((acc) => acc.toString() === accountId);
        if (!account) {
            req.flash('error', 'Account does not belong to the user');
            return res.redirect('/account');
        }

        // Attach account details to the request object
        req.account = foundAccount;
        
        next();
    } 
    
    catch (error) {
        console.error(error.message);
        req.flash('error', 'Server error');
        res.redirect('/account');
    }
};

module.exports = verifyAccountOwnership;
