"use strict";
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable("GalleryTags", {
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
                unique: "galleryTagConstraint",
                primaryKey: true
            },
            TagId: {
                type: Sequelize.INTEGER,
                onDelete: "CASCADE",
                allowNull: false,
                references: {
                    model: "Tags",
                    key: "id"
                },
                unique: "galleryTagConstraint",
                primaryKey: true
            }
        }),
    down: (queryInterface, Sequelize) => queryInterface.dropTable("GalleryTags")
};
