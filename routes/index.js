const router = require('express').Router();
const passport = require('passport');
const savePassword = require('../middleware/psMiddleware').savePs;
const connectdb = require('../config/model')
const User = connectdb.models.User;
const path = require('path')

 router.post('/', passport.authenticate('local', { failureRedirect: '/wrong-password', successRedirect: '/chatroom' }));

 router.post('/register', (req, res) => {
    const checkname = req.body.username
    User.findOne({ username: checkname })
        .then((user) => {
            if (!user){
                const helper = savePassword(req.body.password);
                const salt = helper.salt;
                const hash = helper.hash;
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

router.get('/', (req, res) => {
    res.render('login')
});


router.get('/register', (req, res) => {
    res.render('register')
});


router.get('/chatroom', (req, res) => {
    if(req.session.passport === undefined){
        res.redirect('/')
    }
    else {
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
    }
    
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
});


router.get('/wrong-password', (req, res) => {
    res.send('<h1>Login failed</h1>');
});
router.get('/username-taken', (req, res) => {
    res.send('<h1>Username already taken.</h1>');
});

module.exports = router;