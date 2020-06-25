const debug = require("debug")("api:asset_cont");
const db = require("../models");
const Gallery = db.Gallery;
const Asset = db.Asset;

exports.create = ({ gfsId, filename, width, height, contentType }) =>
    Asset.findOne({
        where: {
            gfsId: gfsId.toString()
        }
    })
        .then(foundAsset => {
            if (!foundAsset) {
                debug("Asset not found!");
                return Asset.create({
                    gfsId: gfsId.toString(),
                    filename,
                    width,
                    height,
                    contentType
                })
                    .then(asset => {
                        debug(">> Created Asset: " + JSON.stringify(asset, null, 2));
                        return asset;
                    })
                    .catch(err => {
                        debug(">> Error while creating Asset: ", err);
                    });
            }

            return foundAsset;
        })
        .catch(err => {
            debug(">> Error while retreiving Asset: ", err);
        });

exports.findAll = () =>
    Asset.findAll({
        include: [
            {
                model: Gallery,
                as: "Galleries",
                attributes: ["id", "galleryName", "galleryDescription"],
                through: {
                    attributes: []
                }
            }
        ]
    })
        .then(assets => assets)
        .catch(err => {
            debug(">> Error while retrieving Assets: ", err);
        });

exports.findById = id =>
    Asset.findByPk(id, {
        include: [
            {
                model: Gallery,
                as: "galleries",
                attributes: ["id", "galleryName", "galleryDescription"],
                through: {
                    attributes: []
                }
            }
        ]
    })
        .then(asset => asset)
        .catch(err => {
            debug(">> Error while finding Asset: ", err);
        });

exports.addGallery = (assetId, galleryId) =>
    Asset.findByPk(assetId)
        .then(asset => {
            if (!asset) {
                debug("Asset not found!");
                return null;
            }
            return Gallery.findByPk(galleryId).then(gallery => {
                if (!gallery) {
                    debug("Gallery not found!");
                    return null;
                }

                asset.addGallery(gallery);
                debug(`>> added Gallery id=${gallery.id} to Asset id=${asset.id}`);
                return asset;
            });
        })
        .catch(err => {
            debug(">> Error while adding Gallery to Asset: ", err);
        });
