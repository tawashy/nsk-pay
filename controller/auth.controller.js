/**
 * Created by tawashy on 11/3/17.
 */
var jwt = require('jsonwebtoken');


var User = require('../models/user');

exports.register = function (req, res) {
    if (!req.body.name){
        return res.status(403).json('no fullname entered');
    }
    if (!req.body.email){
        return res.status(403).json('no email entered');
    }
    if (!req.body.password ){
        return res.status(403).json('no paswword entered');
    }

    User.findOne({email: req.body.email}).exec(function (err, user) {
        if (err) { return res.status(500).end()}
        if (user) { return res.status(403).json('user already signed up.')}

        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email
        });

        newUser.save(function (err, saved) {
            if (err) { return res.status(500).end()}
            return res.json(saved);
        })
    })

};

exports.login = function (req, res) {
    if (!req.body.email || !req.body.password){
        return res.status(403).send({ error: 'Please enter an email and a password'})
    }

    const query = { email: req.body.email };
    User.findOne(query).exec(function (err, user) {
        if (err) return res.status(500).end();
        if (!user )
            return res.status(401).send({ error: ' Authentication failed. User not found.'});


        user.comparePassword(req.body.password, function (err, isMatch) {
            if ( isMatch && !err) {
                res.json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    balance: user.balance,
                    createdAt: user.createdAt
                });
            } else {
                res.status(401).send({ error: 'Authentication failed. Password did not match' });
            }
        });

    });
};