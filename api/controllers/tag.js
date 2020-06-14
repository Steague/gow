const debug = require("debug")("api:tag_cont");
const db = require("../models");
const Gallery = db.Gallery;
const Tag = db.Tag;

exports.create = (tag, type) =>
    Tag.create({
        tag: tag.tag,
        type: tag.type
    })
        .then(tag => {
            debug(">> Created Tag: " + JSON.stringify(tag, null, 2));
            return tag;
        })
        .catch(err => {
            debug(">> Error while creating Tag: ", err);
        });

exports.findAll = () =>
    Tag.findAll({
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
        .then(tags => tags)
        .catch(err => {
            debug(">> Error while retrieving Tags: ", err);
        });

exports.findById = id =>
    Tag.findByPk(id, {
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
