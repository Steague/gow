const express = require('express');
const router = express.Router();
const request = require("request");
const { generateToken, sendToken } = require('../utils/token.utils');
// const passport = require('passport');
// const jwt = require('jsonwebtoken');
const config = require("../config");
require('../passport')();
// require('./../mongoose')();
// const User = require('mongoose').model('User');

// router.route('/auth/google')
//     .post(passport.authenticate('google', { scope: ['profile'] }), (req, res, next) => {
//         if (!req.user) {
//             return res.status(401).send('User Not Authenticated');
//         }
//         req.auth = {
//             id: req.user.id
//         };
//
//         next();
//     }, generateToken, sendToken);
//
// router.route('/auth/google/return')
//     .get(passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//         res.redirect('/admin');
//     });

// (req, res, next) => {
//     const token = req.headers.authorization.substr(7);
//     jwt.verify(token, config.web.client_secret.toString('utf-8'), {algorithms: ['RS256']}, (err, token,) => {
//         console.log("result", err, token);
//         next();
//     });
// }

//var User = require('mongoose').model('User');
//User.upsertGoogleUser(accessToken, refreshToken, profile, cb);

const verifyGoogleToken = (() => (req, res, next) => {
    const tokens = req.headers.authorization.split(', ');
    const bearerTokenHeader = tokens.find(token => token.toLowerCase().startsWith('bearer'));
    const bearerToken = bearerTokenHeader.substr(7);
    const tokenParam = `?id_token=${bearerToken}`;
    const uri = `https://www.googleapis.com/oauth2/v3/tokeninfo${tokenParam}`;
    request({
        method: "post",
        url: uri,
        headers: {
            "content-type": "application/json",
        },
        json: true
    }, (err, validationResponse, validationBody) => {
        if (err) {
            // failed to get validation response
            return res.status(500).send();
        }
        if (validationResponse.statusCode === 200) {
            // console.log(validationBody);
            // User.upsertGoogleUser(accessToken, refreshToken, profile, cb);
            req.user = validationBody;
            return next();
        }
        return res.status(401).send()
    });
})();

router.use(verifyGoogleToken);

// passport.authenticate('google', { scope: ['profile'] }),

router.route('/auth/google')
    .post((req, res, next) => {
        if (!req.user || !config.admins.find(admin => req.user.email === admin)) {
            return res.status(401).send('User Not Authenticated');
        }
        req.auth = {
            id: req.user.email
        };

        next();
    }, generateToken, sendToken);

router.route('/upload')
    .post((req, res, next) => {
        res.send({
            email: req.user.email
        });
    });

module.exports = router;
