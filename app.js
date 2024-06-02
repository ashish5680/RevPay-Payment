if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const path = require('path');

const { v4 : uuid } = require('uuid');

const methodOverride = require('method-override');

const session = require('express-session')
const flash = require('connect-flash');


const passport = require('passport');
const LocalStratergy = require('passport-local');
const BusinessUser = require('./models/businessUser');


const authRouter = require('./routes/authRoutes');
const accountRouter = require('./routes/accountRoutes');
const transactionRouter = require('./routes/transactionRoutes');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'ineedbettersecret',
    resave: false,
    saveUninitialized: true,
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(BusinessUser.authenticate()));
passport.serializeUser(BusinessUser.serializeUser());
passport.deserializeUser(BusinessUser.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});


app.use(authRouter);
app.use(accountRouter);
app.use(transactionRouter);


mongoose.connect('mongodb://localhost:27017/paymentApp-V1')
    .then(() => {
        console.log('Connected to database shopApp-db');
    })
    .catch((err) => {
        console.log(err);
    });


// Home Page
app.get('/', (req, res) => {
    res.render('home');
});


// Error Page
app.get('/error', (req, res) => {
    res.render('error');
});


// Error Page for any other URL which doesn't exist
app.get('*', (req, res) => {
    res.redirect('/error');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server Connected at port 3000');
});