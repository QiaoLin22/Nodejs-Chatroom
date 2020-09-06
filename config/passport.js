const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connectdb = require('./model');
const User = connectdb.models.User;
const validatePs = require('../middleware/psMiddleware').validatePs;


const verifyPs = (username, password, done) => {

    User.findOne({ username: username })
        .then((user) => {

            if (!user) { return done(null, false) }
            
            if (validatePs(password, user.hash, user.salt)) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err))
}

passport.use(new LocalStrategy(verifyPs));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});