const express = require('express');
const router = express.Router();
const request = require("request");
const { generateToken, sendToken, verifyToken } = require('../utils/token.utils');
// const passport = require('passport');
// const jwt = require('jsonwebtoken');
const config = require("../config");
const multer = require('multer');
// const path = require('path');
const fs = require("fs");
// const fstream = require("fstream");
const unzipper = require("unzipper");
// require('../passport')();

// console.log("path", path.join(__dirname, "..", "..", "uploads"));
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

// SET STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, path.join(__dirname, "..", "..", "uploads"));
        if (!fs.existsSync("/tmp/uploads")) {
            const shell = require('shelljs');
            shell.mkdir('-p', "/tmp/uploads");
        }
        cb(null, "/tmp/uploads");
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

const upload = multer({ storage: storage })

const verifyGoogleToken = (req, res, next) => {
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
};

// router.use(verifyGoogleToken);

// passport.authenticate('google', { scope: ['profile'] }),

router.route('/auth/google')
    .post(verifyGoogleToken, (req, res, next) => {
        if (!req.user || !config.admins.find(admin => req.user.email === admin)) {
            return res.status(401).send('User Not Authenticated');
        }
        req.auth = {
            id: req.user.email
        };

        next();
    }, generateToken, sendToken);

router.route('/upload')
    .post(verifyToken, (req, res, next) => {
        // console.log(req.user);
        if (!req.user || !config.admins.find(admin => req.user === admin)) {
            return res.status(401).send('User Not Authenticated');
        }
         // console.log(req);
        next();
    }, upload.single('file'), (req, res, next) => {
        const file = req.file;;
        if (!file) {
            const error = new Error('Please upload a file');
            error.httpStatusCode = 400;
            return next(error);
        }
        next();
        // res.send(file);
    }, (req, res, next) => {
        const file = req.file;
        // const outputPath = `${file.path}-extract`
        // if (!fs.existsSync(outputPath)) {
        //     const shell = require('shelljs');
        //     shell.mkdir('-p', outputPath);
        // }
        // fs.createReadStream(file.path)
        //     .pipe(unzip.Parse())
        //     .pipe(fstream.Writer(outputPath).on('end', (error) => {
        //         if (error) {
        //             const error = new Error('Error processing file');
        //             error.httpStatusCode = 400;
        //             return next(error);
        //         }
        //
        //         console.log("foo");
        //         res.send(file);
        //     }));

        fs.createReadStream(file.path)
            .pipe(unzipper.Parse())
            .on('entry', entry => entry.autodrain())
            .promise()
            .then(() => {
                console.log('done');
            }).catch(console.log).finally(() => {
                res.send(file);
            });
    });

module.exports = router;
