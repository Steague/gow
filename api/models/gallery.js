"use strict";
module.exports = (sequelize, DataTypes) => {
    const Gallery = sequelize.define(
        "Gallery",
        {
            uuid: {
                allowNull: false,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            galleryName: {
                allowNull: false,
                type: DataTypes.STRING
            },
            galleryDescription: {
                allowNull: false,
                type: DataTypes.STRING(10 * 1024) // 10KB
            },
            releaseDate: {
                allowNull: false,
                type: DataTypes.DATE
            },
            assetOrder: {
                allowNull: false,
                type: DataTypes.STRING(33 * 1000 - 1) // 1000x MD5 hashes w/ delimiters
            }
        },
        {
            indexes: [{ fields: ["uuid"] }]
        }
    );
    Gallery.associate = models => {
        Gallery.hasMany(models.GalleryTags, {
            as: "Tags"
        });
        Gallery.hasMany(models.GalleryAssets, {
            as: "Assets"
        });
    };
    return Gallery;
};
