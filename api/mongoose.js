var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = () => {

    var conn = mongoose.connect('mongodb://gfs:27017/gallery-assets', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    var UserSchema = new Schema({
        googleProvider: {
            type: {
                id: String,
                token: String
            },
            select: false
        }
    });
    //
    UserSchema.set('toJSON', {getters: true, virtuals: true});

    UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
        var that = this;
        return this.findOne({
            'googleProvider.id': profile.id
        }, (err, user) => {
            // no user was found, lets create a new one
            if (!user) {
                var newUser = new that({
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    googleProvider: {
                        id: profile.id,
                        token: accessToken
                    }
                });

                newUser.save((error, savedUser) => {
                    if (error) {
                        console.log(error);
                    }
                    return cb(error, savedUser);
                });
            } else {
                return cb(err, user);
            }
        });
    };

    mongoose.model('User', UserSchema);

    return conn;
};
