/**
 * Created by tawashy on 9/21/17.
 */
/* User Model */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs');

// the User schema's structure
var schema = new Schema({
    name:       { type: String, required: true },
    email:      { type: String, lowercase: true, required: true },
    password:   { type: String, required: true },
    balance:    { type: Number, default: 0.00 },
    ACL:        { type: String, enum: ['POS', 'Customer'], default: 'Customer'},
    createdAt: { type: Date, default: Date.now()}
});

// An empty function
var noop = function () {};

// before save function
schema.pre('save', function (done) {
    var user = this;

    // Check if the user have not modified his password,
    // if true call the call back function 'done'
    if (!user.isModified('password')){
        return done;
    }

    // encrypt the user password
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {return done(err); }
        bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
            if (err) {return done(err); }
            user.password = hashedPassword;
            done();
        });
    });

});

// compare password function
schema.methods.comparePassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};


// creating the user's model and exporting it
module.exports = users = mongoose.model('User', schema );