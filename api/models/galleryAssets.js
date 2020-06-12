'use strict';
module.exports = (sequelize, DataTypes) => {
    const GalleryAssets = sequelize.define('GalleryAssets', {}, {});
    GalleryAssets.associate = (models) => {
        models.Asset.belongsToMany(models.Gallery, {through: GalleryAssets});
        models.Gallery.belongsToMany(models.Asset, {through: GalleryAssets});
    };
    return GalleryAssets;
};
