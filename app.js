const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var routes = require('./routes');
const path = require('path')
const connection = require('./config/database');
const Mongosession = require('connect-mongo')(session);
const mongodb = require('mongodb').MongoClient
const socketclient = require('socket.io').listen(5000).sockets
require('dotenv').config();
require('./config/passport');

var app = express();
app.set('view engine','ejs')
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const sessiondb = new Mongosession({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessiondb,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(routes);
app.listen(3000);

mongodb.connect(process.env.DB_STRING, function(err,db){
    if(err){
        throw err;
    }
    socketclient.on('connection', (socket) => {
        let chat = db.collection('chats')
        chat.find().limit(12).sort({_id:1})
        .toArray((err, res) => {
            if(err){
                throw err
            }
            socket.emit('output',res)
        })
        socket.on('chat',(data) => {
            let name = data.name
            let message = data.message
            let date = data.date
            if(name !== '' && message !== ''){
                chat.insert({name:name,message:message,date:date},() => {
                    socketclient.emit('output',[data])
                })
            } 
        })
        socket.on('clear', () => {
            chat.remove({}, () => {
                socket.emit('deleted');
            });
        });
        
    })
})