const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// Create a new user
exports.user_create = (req, res) => {

    // Check if user with given email is already registered
    User.find({email: req.body.email}).exec()
    .then((user) => {
        // If user exists
        if(user.length >= 1) {
            return res.status(409).json({message: 'Given email is already taken'}); 
        } else {

            // Create salt and hash password
            bcrypt.hash(req.body.password, 10, (err,hash) => {
                if(err) {
                    // On error, return error
                    return res.status(500).json({
                        error: err.message
                    });
                } else {
                    // Create user with new hash and salt
                    const user = new User({
                        email: req.body.email,
                        password: hash,
                        nickname: req.body.nickname,
                    });
                    user.save().then((result) => {
                        res.status(201).json({
                            message: 'user created',
                        });
                    }).catch((err) => {
                        res.status(500).json({message: err.message})
                    });
                }
            });
        }
    });
};

// Login
exports.user_login = (req, res) => {
    // Check if user exists
    User.find({email: req.body.email}).select('+password').exec()
    .then((user) => {
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Authorization failed'
            });
        }
        
        // Hash input password and compare with hash
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    message: 'Authorization failed',
                });
            }
            if(result) {
                // Generate JWT
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id,
                    nickname: user[0].nickname,
                }, process.env.JWT_KEY, {
                    expiresIn: '1h',
                });

                return res.status(200).json({
                    token: token,
                })
            }
        });
    })
    .catch((error) => {
        res.status(500).json({message: error.message})
    });
};

// Delete user with given id
exports.user_delete = (req, res, next) => {
    // Check if authorized user is the user to be deleted
    if(req.params.userId !== req.userData.userId) {
        return res.status(401).json({
            message: 'Authorization failed'
        });
    }

    User.deleteOne({_id: req.params.userId}).exec()
    .then((result) => {
        res.status(200).json({message: 'user deleted'});
    })
    .catch((error) => res.status(500).json({message: error.message}))
};