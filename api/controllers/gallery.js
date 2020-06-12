const db = require("../models");
const Gallery = db.Gallery;
const Tag = db.Tag;
const Asset = db.Asset;

exports.create = (gallery) => Gallery.create({
    galleryName: gallery.galleryName,
    galleryDescription: gallery.galleryDescription,
    releaseDate: gallery.releaseDate,
    assetOrder: gallery.assetOrder
}).then((gallery) => {
    console.log(">> Created Gallery: " + JSON.stringify(gallery, null, 4));
    return gallery;
}).catch((err) => {
    console.log(">> Error while creating Gallery: ", err);
});

exports.findAll = () => Gallery.findAll({
    include: [
        {
            model: Tag,
            as: "Tags",
            attributes: ["id", "tag"],
            through: {
                attributes: [],
            },
            // through: {
            //   attributes: ["tag_id", "gallery_id"],
            // },
        },{
            model: Asset,
            as: "Assets",
            attributes: [
                "id",
                "gfsId",
                "filename",
                "width",
                "height",
                "contentType"
            ],
            through: {
                attributes: [],
            },
            // through: {
            //   attributes: ["tag_id", "gallery_id"],
            // },
        }
    ],
}).then((galleries) => galleries).catch((err) => {
    console.log(">> Error while retrieving galleries: ", err);
});

exports.findById = (id) => Gallery.findByPk(id, {
    include: [
        {
            model: Tag,
            as: "Tags",
            attributes: ["id", "tag"],
            through: {
                attributes: [],
            },
            // through: {
            //   attributes: ["tag_id", "gallery_id"],
            // },
        },{
            model: Asset,
            as: "Assets",
            attributes: [
                "id",
                "gfsId",
                "filename",
                "width",
                "height",
                "contentType"
            ],
            through: {
                attributes: [],
            },
            // through: {
            //   attributes: ["tag_id", "gallery_id"],
            // },
        }
    ],
}).then((gallery) => gallery).catch((err) => {
    console.log(">> Error while finding Gallery: ", err);
});

exports.findByUuid = (id) => Gallery.findOne({
    where: {
        uuid: id
    },
    include: [
        {
            model: Tag,
            as: "Tags",
            attributes: ["tag"],
            through: {
                attributes: [],
            }
        },{
            model: Asset,
            as: "Assets",
            attributes: [
                "gfsId",
                "filename",
                "width",
                "height"
            ],
            through: {
                attributes: [],
            }
        }
    ],
}).then((gallery) => {
    console.log({gallery});
    return gallery
}).catch((err) => {
    console.log(">> Error while finding Gallery: ", err);
});
