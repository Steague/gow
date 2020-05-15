require('./mongoose')();
var passport = require('passport');
var User = require('mongoose').model('User');
var GoogleTokenStrategy = require('passport-google-oauth20').Strategy;
var config = require('./config');

module.exports = () => {
    passport.use(new GoogleTokenStrategy({
            clientID: config.web.client_id,
            clientSecret: config.web.client_secret,
            callbackURL: config.web.redirect_uris[0]
        },
        (accessToken, refreshToken, profile, cb) => {
            User.upsertGoogleUser(accessToken, refreshToken, profile, cb);
        }));
};
