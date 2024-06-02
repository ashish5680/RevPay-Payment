const express = require("express");
const router = express.Router();

const BusinessUser = require("../models/businessUser");
const passport = require("passport");



// Get the Signup page
router.get("/signup", (req, res) => {
  res.render("auth/signup");
});




// Register the new user to the database
router.post("/register", async (req, res) => {
  
  if (req.body.password != req.body.confirmPassword) {
    req.flash("error", "Confirm Password does not match");
    return res.redirect("/signup");
  }

  if (!req.body.email) {
    req.flash("error", "Email is required to Register your account");
    return res.redirect("/signup");
  }

  const credentials = req.body;

  try {

    const user = new BusinessUser({
      username: credentials.username,
      email: credentials.email,
    });

    await BusinessUser.register(user, credentials.password);

    req.flash("success",`Welcome ${credentials.username}, Please login to continue!`);
    res.redirect("/login");
  } 
  
  catch (e) {
    console.error(e);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});




//Get the login page
router.get("/login", (req, res) => {
  res.render("auth/login");
});




// Login the user
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),

  (req, res) => {
    const { username } = req.body;

    req.flash("success", `Welcome Back ${username} !!`);
    res.redirect("/account");
  }
);




// Logout the user
router.get("/logout", (req, res) => {

  req.logout((err) => {
    if (err) {
      req.flash("error", "Unable to logout");
      return res.redirect("/login");
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/login");
  });

});



module.exports = router;
