const crypto = require('crypto');

function genPs(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
    return {
      salt: salt,hash: hash
    };
}

function validatePs(password, hash, salt) {
    var deHash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
    return hash === deHash;
}

module.exports.validatePs = validatePs;
module.exports.genPs = genPs;