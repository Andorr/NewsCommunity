// @flow
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
import type { $Request, $Response } from 'express';

const User = require('../models/user');

// Create a new user
exports.user_create = (req: $Request, res: $Response) => {

    // Check if user with given email is already registered
    User.find({email: req.body.email}).exec()
    .then((user: User[]) => {
        // If user exists
        if(user.length >= 1) {
            return res.status(409).json({message: 'Given email is already taken'}); 
        } else {

            // Create salt and hash password
            bcrypt.hash(req.body.password, 10, (err: Error , hash: string) => {
                if(err) {
                    // On error, return error
                    return res.status(500).json({
                        error: err.message
                    });
                } else {
                    // Create user with new hash and salt
                    const user: User = new User({
                        email: req.body.email,
                        password: hash,
                        nickname: req.body.nickname,
                    });
                    user.save().then((result: User) => {
                        res.status(201).json(result);
                    }).catch((err: any) => {
                        res.status(500).json({message: err.message})
                    });
                }
            });
        }
    });
};

// Login
exports.user_login = (req: $Request, res: $Response) => {
    // Check if user exists
    User.find({email: req.body.email}).select('+password').exec()
    .then((user) => {
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Authorization failed'
            });
        }
        
        // Hash input password and compare with hash
        bcrypt.compare(req.body.password, user[0].password, (err: Error, status: bool) => {
            if(err) {
                return res.status(401).json({
                    message: 'Authorization failed',
                });
            }
            if(status) {
                // Generate JWT
                const token: string = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id,
                    nickname: user[0].nickname,
                }, process.env.JWT_KEY || '', {
                    expiresIn: '1h',
                });

                return res.status(200).json({
                    token: token,
                })
            }
        });
    })
    .catch((error: any) => {
        res.status(500).json({message: error.message})
    });
};

// Delete user with given id
exports.user_delete = (req: $Request, res: $Response) => {
    // Check if authorized user is the user to be deleted
    if(req.params.userId !== req.userData.userId) {
        return res.status(404).json({
            message: 'Action is forbidden for this user'
        });
    }

    User.deleteOne({_id: req.params.userId}).exec()
    .then((result: any) => {
        res.status(200).json({message: 'user deleted'});
    })
    .catch((error: any) => res.status(500).json({message: error.message}))
};

// Get user information
exports.user_get = (req: $Request, res: $Response) => {
    
    // Get User
    User.findById(req.userData.userId, (err: Error, user: User) => {
        if(err) {
            res.status(404).json({message: err.message});
        } else {
            res.status(200).json(user);
        }
    })
    .catch((error: any) => {
        res.status(500).json({message: error.message})
    });

}

// Change profile image
exports.user_set_image = (req: $Request, res: $Response) => {

    // Get user
    User.findById(req.userData.userId, (err: Error, user: User) => {
        if(err) {
            res.status(404).json({message: err.message});
        } else {
             // Link to uploaded/given image
            const image: ?string = (req.file)? req.file.location : null;
            user.image = image;
            
            // Save user
            user.save().then((result: User) => {
                res.status(200).json(result);
            }).catch((err: any) => {
                res.status(500).json({message: err.message})
            });
        }
    });
}