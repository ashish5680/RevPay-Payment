const express = require("express");
const router = express.Router();

const Account = require("../models/account");

const isLoggedIn = require('../middleware/isLoggedIn');
const verifyAccountOwnership = require('../middleware/verifyAccountOwnership');

const mongoose = require("mongoose");
const BusinessUser = require("../models/businessUser");

const Transaction = require("../models/transaction");




// Render deposit form
router.get("/account/:id/deposit", isLoggedIn, verifyAccountOwnership, async (req, res) => {
  try {
    const account = req.account;
    res.render("transactions/deposit", { account });
  } 
  catch (error) {
    console.error(error.message);
    req.flash("error", error.message);
    res.render("error");
  }
});


// Render withdrawal form
router.get("/account/:id/withdrawal", isLoggedIn, verifyAccountOwnership, async (req, res) => {
  try {
    const account = req.account;
    res.render("transactions/withdrawal", { account });
  }
   
  catch (error) {
    console.error(error.message);
    req.flash("error", error.message);
    res.render("error");
  }
});










// Get all transactions of an account
router.get("/account/:id/transactions", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  try {
    const accountId = req.params.id;
    const account = req.account;
    const transactions = await Transaction.find({ accountId }).sort({ timestamp: -1 });

    if (!transactions || transactions.length === 0) {
      req.flash("error", "No transactions found for this account");
      return res.redirect(`/account/${account._id}`); 
    }

    res.render("transactions/show", { transactions }); 
  } 
  
  catch (error) {
    console.error(error.message);
    req.flash("error", error.message);
    res.redirect("/error"); 
  }

});








// Deposit the Money To Bank Account
router.post("/account/:id/deposit", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  const accountId = req.params.id;
  try {
    
    const { amount, beneficiaryAccountNumber, beneficiarySortCode } = req.body;

    const depositAmount = Number(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      req.flash('error', 'Invalid deposit amount');
      return res.redirect(`/account/${accountId}/deposit`);
    }

    const accountDetails = await Account.findById(accountId);
    if (accountDetails.activationStatus === "INACTIVE") {
      req.flash('error', 'Your account is inactive. You need to activate your account first in order to perform any transaction.');
      return res.redirect(`/account/${accountId}/deposit`);
    }
    if (!accountDetails.allowCredit) {
      req.flash('error', 'Deposits are not allowed on this account');
      return res.redirect(`/account/${accountId}/deposit`);
    }

    if (accountDetails.accountNumber !== Number(beneficiaryAccountNumber) || accountDetails.sortCode !== Number(beneficiarySortCode)) {
      req.flash('error', 'Beneficiary account details does not match the logged-in user\'s account');
      return res.redirect(`/account/${accountId}/deposit`);
    }

    const transaction = new Transaction({
      accountId,
      amount: depositAmount,
      transactionType: "DEPOSIT",
      beneficiaryAccountNumber,
      beneficiarySortCode,
    });

    accountDetails.balance += depositAmount;
    accountDetails.transactions.push(transaction);
    await transaction.save();
    await accountDetails.save();

    req.flash('success', 'Deposit successful');
    res.redirect(`/account/${accountId}`);
  } 
  
  catch (error) {
    console.error(error.message);
    req.flash('error', error.message);
    res.redirect(`/account/${accountId}/deposit`);
  }
});













// Withdraw the Money From the Bank Account
router.post("/account/:id/withdrawal", isLoggedIn, verifyAccountOwnership, async (req, res) => {

  const accountId = req.params.id;

  try {
    
    const { amount, beneficiaryAccountNumber, beneficiarySortCode } = req.body;

    const withdrawalAmount = Number(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      req.flash('error', 'Invalid withdrawal amount');
      return res.redirect(`/account/${accountId}/withdrawal`);
    }

    const accountDetails = await Account.findById(accountId);
    if (accountDetails.activationStatus === "INACTIVE") {
      req.flash('error', 'Your account is inactive. You need to activate your account first in order to perform any transaction.');
      return res.redirect(`/account/${accountId}/withdrawal`);
    }
    if (!accountDetails.allowDebit) {
      req.flash('error', 'Withdrawals are not allowed on this account');
      return res.redirect(`/account/${accountId}/withdrawal`);
    }

    if (accountDetails.accountNumber !== Number(beneficiaryAccountNumber) || accountDetails.sortCode !== Number(beneficiarySortCode)) {
      req.flash('error', 'Beneficiary account details do not match the logged-in user\'s account');
      return res.redirect(`/account/${accountId}/withdrawal`);
    }

    if (accountDetails.balance < withdrawalAmount) {
      req.flash('error', 'Insufficient balance');
      return res.redirect(`/account/${accountId}/withdrawal`);
    }


    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const transactions = await Transaction.find({
      accountId: accountDetails._id,
      transactionType: "WITHDRAWAL",
      timestamp: { $gte: startOfDay, $lt: endOfDay }
    });
    
    let totalWithdrawnToday = 0;
    for (const transaction of transactions) {
      totalWithdrawnToday += transaction.amount;
    }
    
    const remainingLimit = accountDetails.dailyWithdrawalLimit - totalWithdrawnToday;
    
    if (withdrawalAmount > remainingLimit) {
      req.flash('error', `Exceeds daily withdrawal limit. Remaining limit: ${remainingLimit}`);
      return res.redirect(`/account/${accountId}/withdrawal`);
    }
      

    const transaction = new Transaction({
      accountId,
      amount: withdrawalAmount,
      transactionType: "WITHDRAWAL",
      beneficiaryAccountNumber,
      beneficiarySortCode,
    });

    accountDetails.balance -= withdrawalAmount;
    accountDetails.transactions.push(transaction);
    await transaction.save();
    await accountDetails.save();

    req.flash('success', 'Withdrawal successful');
    res.redirect(`/account/${accountId}`);
  } 
  
  catch (error) {
    console.error(error.message);
    req.flash('error', error.message);
    res.redirect(`/account/${accountId}/withdrawal`);
  }
});











module.exports = router;
