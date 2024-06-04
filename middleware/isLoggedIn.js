const isLoggedIn = (req, res, next) => {

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to login first');
        return res.redirect('/login');
    }

    // Proceed to the next middleware or route handler
    next();

}

module.exports = isLoggedIn;