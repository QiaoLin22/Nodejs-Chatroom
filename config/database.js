const mongoose = require('mongoose');
require('dotenv').config();
const db = process.env.DB_STRING;

const connectdb = mongoose.createConnection(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
});

User = connectdb.model('User', UserSchema);
module.exports = connectdb;