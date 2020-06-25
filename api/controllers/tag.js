const debug = require("debug")("api:tag_cont");
const db = require("../models");
const Gallery = db.Gallery;
const Tag = db.Tag;
const Asset = db.Asset;

exports.create = ({ tag, type }) =>
    Tag.findOne({
        where: {
            tag
        }
    })
        .then(foundTag => {
            if (!foundTag) {
                debug("Tag not found!");
                return Tag.create({
                    tag,
                    type
                })
                    .then(tag => {
                        debug(">> Created Tag: " + JSON.stringify(tag, null, 2));
                        return tag;
                    })
                    .catch(err => {
                        debug(">> Error while creating Tag: ", err);
                    });
            }

            return foundTag;
        })
        .catch(err => {
            debug(">> Error while retreiving Tag: ", err);
        });

exports.findAll = () =>
    Tag.findAll({
        include: [
            {
                model: Gallery,
                as: "galleries",
                attributes: [
                    "uuid",
                    "galleryName",
                    "galleryDescription",
                    "releaseDate",
                    "assetOrder",
                    "featuredImage"
                ],
                through: {
                    attributes: []
                }
            }
        ]
    })
        .then(tags => tags)
        .catch(err => {
            debug(">> Error while retrieving Tags: ", err);
        });

exports.findByTag = tag =>
    Tag.findOne({
        where: { tag },
        order: [[Gallery, "releaseDate", "DESC"]],
        include: [
            {
                model: Gallery,
                as: "Galleries",
                attributes: [
                    "uuid",
                    "galleryName",
                    "galleryDescription",
                    "releaseDate",
                    "assetOrder",
                    "featuredImage"
                ],
                through: {
                    attributes: []
                },
                include: [
                    {
                        model: Tag,
                        as: "Tags",
                        attributes: ["tag", "type"],
                        through: "GalleryTags"
                    },
                    {
                        model: Asset,
                        as: "Assets",
                        attributes: ["gfsId", "filename", "width", "height"],
                        through: "GalleryAssets"
                    }
                ]
            }
        ]
    })
        .then(tag => tag)
        .catch(err => {
            debug(">> Error while finding Tag: ", err);
        });

exports.findById = id =>
    Tag.findByPk(id, {
        include: [
            {
                model: Gallery,
                as: "Galleries",
                attributes: [
                    "uuid",
                    "galleryName",
                    "galleryDescription",
                    "releaseDate",
                    "assetOrder",
                    "featuredImage"
                ],
                through: {
                    attributes: []
                }
            }
        ]
    })
        .then(tag => tag)
        .catch(err => {
            debug(">> Error while finding Tag: ", err);
        });

exports.addGallery = (tagId, galleryId) =>
    Tag.findByPk(tagId)
        .then(tag => {
            if (!tag) {
                debug("Tag not found!");
                return null;
            }
            return Gallery.findByPk(galleryId).then(gallery => {
                if (!gallery) {
                    debug("Gallery not found!");
                    return null;
                }

                tag.addGallery(gallery);
                debug(`>> added Gallery id=${gallery.id} to Tag id=${tag.id}`);
                return tag;
            });
        })
        .catch(err => {
            debug(">> Error while adding Gallery to Tag: ", err);
        });
