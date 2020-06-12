const express = require('express');
const router = express.Router();
const request = require("request");
const { generateToken, sendToken, verifyToken } = require('../utils/token.utils');
const config = require("../config/config.json");
const multer = require('multer');
const fs = require("fs");
const unzipper = require("unzipper");
const md5File = require('md5-file');
const crypto = require("crypto");
const path = require("path");
const GridFsStorage = require("multer-gridfs-storage");

const db = require("../models");
const GalleryController = require("../controllers/gallery");
const TagController = require("../controllers/tag");
const AssetController = require("../controllers/asset");

const mongoURI = "mongodb://gfs:27017/gallery-assets";
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) return reject(err);
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const { metadata } = req.body;
                const { files } = req;
                const [width, height, scaleRatio, md5] = metadata[(files.length - 1)].split(":");
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                    metadata: {
                        width,
                        height,
                        scaleRatio,
                        md5
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({storage});

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
            req.user = validationBody;
            return next();
        }
        return res.status(401).send()
    });
};

router.route('/auth/google')
    .post(verifyGoogleToken, (req, res, next) => {
        if (!req.user || !config.development.admins.find(admin => req.user.email === admin)) {
            return res.status(401).send('User Not Authenticated');
        }
        req.auth = {
            id: req.user.email
        };

        next();
    }, generateToken, sendToken);

router.route('/upload')
    // .post(verifyToken, (req, res, next) => {
    //     if (!req.user || !config.development.admins.find(admin => req.user === admin)) {
    //         return res.status(401).send('User Not Authenticated');
    //     }
    //     next();
    .post((req, res, next) => {
        next();
    }, upload.array('files[]', 1000), async (req, res, next) => {
        const { galleryName, galleryDescription, releaseDate, tags, featuredImage: featuredImageString } = req.body;
        const featuredImage = JSON.parse(featuredImageString);
        const { files } = req;

        try {
            const newGallery = await GalleryController.create({
                galleryName,
                galleryDescription,
                releaseDate,
                assetOrder: files.map(({id}) => (id)).join(",")
            });
            if (newGallery && newGallery.id) {
                tags.forEach(async tag => {
                    const newTag = await TagController.create({tag});
                    await TagController.addGallery(newTag.id, newGallery.id);
                });
                files.forEach(async ({id: gfsId, filename, metadata: { width, height, scaleRatio, md5 }, contentType}) => {
                    const newAsset = await AssetController.create({
                        gfsId,
                        filename,
                        width,
                        height,
                        contentType
                    });
                    await AssetController.addGallery(newAsset.id, newGallery.id);
                });

                res.send({galleryId: newGallery.uuid});
            }
        } catch (err) {
            console.log(err);
            res.status(400).send('Bad Request');
        }
    });

router.route('/galleries/all')
    .get(async (req, res, next) => {
        const galleries = await GalleryController.findAll();
        if (!galleries) {
            return res.status(404).json({
                err: "no galleries exist"
            });
        }
        res.send(galleries);
    });

router.route('/galleries/:id')
    .get(async (req, res, next) => {
        const{ id } = req.params;
        const gallery = await GalleryController.findByUuid(id);
        if (!gallery) {
            return res.status(404).json({
                err: "no gallery exist"
            });
        }
        console.log("result", JSON.parse(JSON.stringify(gallery)));
        res.send(gallery);
    });

router.route('/sync')
    .get((req, res, next) => {
        db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
            res.send({
                message: "OK"
            });
        });
    });

router.route("/image/:filename")
    .get((req, res) => {
        const { gfs } = req;
        const{ filename } = req.params;
        console.log({filename, gfs});
        const file = gfs
            .find({filename})
            .toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        err: "no files exist"
                    });
                }
                gfs.openDownloadStreamByName(req.params.filename).pipe(res);
            });
    });

router.route("/files")
    .get((req, res) => {
        const { gfs } = req;
        gfs.find().toArray((err, files) => {
            // check if files
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }

            return res.json(files);
        });
    });

router.route('/galleries')
    .get((req, res, next) => {
        res.send({
            message: "OK"
        });
    });

module.exports = router;
