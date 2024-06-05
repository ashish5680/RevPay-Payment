const express = require("express");
const router = express.Router();

const Account = require("../models/account");

const isLoggedIn = require('../middleware/isLoggedIn');
const verifyAccountOwnership = require('../middleware/verifyAccountOwnership');

const mongoose = require("mongoose");
const BusinessUser = require("../models/businessUser");



// Get all accounts of the logged-in user
router.get("/account", isLoggedIn, async (req, res) => {

  try {
    const user = await BusinessUser.findById(req.user.id).populate("accounts");

    if (!user || user.accounts.length === 0) {
      req.flash("error", "No Accounts Found");
      return res.render("accounts/index", { accounts: [] });
    }

    res.render("accounts/index", { accounts: user.accounts });

  } 
  
  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.render("error");
  }

});







// Get account by ID
router.get("/account/:id", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  try {

    const account = req.account;
    res.render("accounts/show", { account: account });

  } 
  
  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.render("error");
  }

});



// Getting page for adding new account 
router.get("/newAccount", isLoggedIn,  async(req, res) => {

  try {
      res.render("accounts/new");
  } 
  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.render("error");
  }

});



// Create a new account
router.post("/account", isLoggedIn, async (req, res) => {

    const { accountNumber, sortCode } = req.body;

    try {

      const newAccount = new Account({
        businessId: req.user.id,
        accountNumber,
        sortCode,
        ...req.body
      });

      const account = await newAccount.save();

      const currentUser = req.user;

      await currentUser.accounts.push(account);
      currentUser.qtyOfAccounts = currentUser.accounts.length;

      await currentUser.save();

      req.flash("success", "Account created successfully!");

      res.redirect("/account");
    } 
    
    catch (err) {
      console.error(err.message);
      req.flash("error", err.message);
      res.redirect("/account")
    }

  }

);






// Getting the Page to Change the Accounts Setting
router.get('/account/:id/edit', isLoggedIn,  verifyAccountOwnership,  async (req, res) => {

  try {
      const account = req.account;
      res.render('accounts/edit', {account});
  } 
  
  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.render("error");
  }

})



// Change the account Settings
router.patch("/account/:id", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  try {
    const { activationStatus, allowCredit, allowDebit, dailyWithdrawalLimit } = req.body;
    const account = req.account;

    if (activationStatus !== undefined) account.activationStatus = activationStatus;
    if (allowCredit !== undefined) account.allowCredit = allowCredit;
    if (allowDebit !== undefined) account.allowDebit = allowDebit;
    if (dailyWithdrawalLimit !== undefined) account.dailyWithdrawalLimit = dailyWithdrawalLimit;

    await account.save();

    req.flash("success", "Account updated successfully");
    res.redirect(`/account/${account._id}`);
  } 
  
  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.redirect(`/account/${req.params.id}/edit`);
  }
});








// Get account balance by ID
router.get("/account/:id/balance", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  try {
    // Fetch only the balance field from the account document
    const account = req.account;

    res.render("accounts/balance", { account });
  } 

  catch (err) {
    console.error(err.message);
    req.flash("error", err.message);
    res.render("error");
  }

});




module.exports = router;
