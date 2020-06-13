"use strict";
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable("GalleryAssets", {
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("NOW()")
            },
            GalleryId: {
                type: Sequelize.INTEGER,
                onDelete: "CASCADE",
                allowNull: false,
                references: {
                    model: "Galleries",
                    key: "id"
                },
                unique: "galleryAssetConstraint",
                primaryKey: true
            },
            AssetId: {
                type: Sequelize.INTEGER,
                onDelete: "CASCADE",
                allowNull: false,
                references: {
                    model: "Assets",
                    key: "id"
                },
                unique: "galleryAssetConstraint",
                primaryKey: true
            }
        }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable("GalleryAssets")
};
