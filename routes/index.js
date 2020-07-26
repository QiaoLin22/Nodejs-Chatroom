const router = require('express').Router();
const passport = require('passport');
const savePassword = require('../lib/passwordUtils').savePassword;
const connectdb = require('../config/database')
const User = connectdb.models.User;
const path = require('path')

 router.post('/', passport.authenticate('local', { failureRedirect: '/wrong-password', successRedirect: '/chatroom' }));

 router.post('/register', (req, res, next) => {
    const checkname = req.body.username
    User.findOne({ username: checkname })
        .then((user) => {
            if (!user){
                const saltHash = savePassword(req.body.password);
                const salt = saltHash.salt;
                const hash = saltHash.hash;
                const newUser = new User({
                username: req.body.username,
                hash: hash,
                salt: salt,
                admin: true
                });

                newUser.save()
                .then((user) => {
                    console.log(user);
                });
                res.redirect('/');
            }
            else{
                res.redirect('/username-taken');
            }
        })
        .catch((err) => {   
            console.log(err)
    });
    
 });

router.get('/', (req, res, next) => {
    res.render('login')
});


router.get('/register', (req, res, next) => {
    res.render('register')
});


router.get('/chatroom', (req, res, next) => {
    if(req.session.passport === undefined){
        res.redirect('/')
    }
    const id = (req.session.passport.user)

    if (req.isAuthenticated()) {
        User.findOne({ _id: id })
        .then((user) => {
            var username = user.username
            res.render('index',{username : username})
        })
        .catch((err) => {   
            console.log(err)
    });
        
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/">Login</a></p>');
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/')
});


router.get('/wrong-password', (req, res, next) => {
    res.send('<h1>Login failed</h1>');
});
router.get('/username-taken', (req, res, next) => {
    res.send('<h1>Username already taken.</h1>');
});

module.exports = router;