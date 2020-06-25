const debug = require("debug")("api:gallery_cont");
const db = require("../models");
const Gallery = db.Gallery;
const Tag = db.Tag;
const Asset = db.Asset;

exports.create = gallery =>
    Gallery.create({
        galleryName: gallery.galleryName,
        galleryDescription: gallery.galleryDescription,
        releaseDate: gallery.releaseDate,
        assetOrder: gallery.assetOrder,
        featuredImage: gallery.featuredImage.toString()
    })
        .then(gallery => {
            debug(">> Created Gallery: " + JSON.stringify(gallery, null, 4));
            return gallery;
        })
        .catch(err => {
            debug(">> Error while creating Gallery: ", err);
        });

exports.findAll = () =>
    Gallery.findAll({
        order: [["releaseDate", "DESC"]],
        include: [
            {
                model: Tag,
                as: "Tags",
                attributes: ["tag", "type"],
                through: {
                    attributes: []
                }
                // through: {
                //   attributes: ["tag_id", "gallery_id"],
                // },
            },
            {
                model: Asset,
                as: "Assets",
                attributes: ["gfsId", "filename", "width", "height"],
                through: {
                    attributes: []
                }
                // through: {
                //   attributes: ["tag_id", "gallery_id"],
                // },
            }
        ]
    })
        .then(galleries => galleries)
        .catch(err => {
            debug(">> Error while retrieving galleries: ", err);
        });

exports.findById = id =>
    Gallery.findByPk(id, {
        include: [
            {
                model: Tag,
                as: "Tags",
                attributes: ["tag", "type"],
                through: {
                    attributes: []
                }
                // through: {
                //   attributes: ["tag_id", "gallery_id"],
                // },
            },
            {
                model: Asset,
                as: "Assets",
                attributes: ["gfsId", "filename", "width", "height"],
                through: {
                    attributes: []
                }
                // through: {
                //   attributes: ["tag_id", "gallery_id"],
                // },
            }
        ]
    })
        .then(gallery => gallery)
        .catch(err => {
            debug(">> Error while finding Gallery: ", err);
        });

exports.findByTag = tag =>
    Gallery.findAll({
        order: [["releaseDate", "DESC"]],
        include: [
            {
                model: Tag,
                as: "Tags",
                attributes: ["tag", "type"],
                through: "GalleryTags",
                where: { tag }
            },
            {
                model: Asset,
                as: "Assets",
                attributes: ["gfsId", "filename", "width", "height"],
                through: "GalleryAssets"
            }
        ]
    })
        .then(galleries => {
            debug({ galleries });
            return galleries;
        })
        .catch(err => {
            debug(">> Error while finding Galleries: ", err);
        });

exports.findByUuid = id =>
    Gallery.findOne({
        where: {
            uuid: id
        },
        include: [
            {
                model: Tag,
                as: "Tags",
                attributes: ["tag", "type"],
                through: {
                    attributes: []
                }
            },
            {
                model: Asset,
                as: "Assets",
                attributes: ["gfsId", "filename", "width", "height"],
                through: {
                    attributes: []
                }
            }
        ]
    })
        .then(gallery => {
            debug({ gallery });
            return gallery;
        })
        .catch(err => {
            debug(">> Error while finding Gallery: ", err);
        });
