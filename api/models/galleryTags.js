'use strict';
module.exports = (sequelize, DataTypes) => {
    const GalleryTags = sequelize.define('GalleryTags', {}, {});
    GalleryTags.associate = (models) => {
        models.Tag.belongsToMany(models.Gallery, {through: GalleryTags});
        models.Gallery.belongsToMany(models.Tag, {through: GalleryTags});
    };
    return GalleryTags;
};
