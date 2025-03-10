require('dotenv').config();

const express = require('express'); 
const app = express(); 
const session = require('express-session');
const passport = require('./passport');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET 
}));

app.set('view engine', 'ejs');

const userRoutes = require('./routes/userRoute');

app.use('/',userRoutes);

app.listen(3006 , () => { 
	console.log("Server Running on port 3006"); 
});