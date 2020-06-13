"use strict";
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface
            .createTable("Galleries", {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                uuid: {
                    allowNull: false,
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4
                },
                galleryName: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                galleryDescription: {
                    allowNull: false,
                    type: Sequelize.STRING(10 * 1024) // 10KB
                },
                releaseDate: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                assetOrder: {
                    allowNull: false,
                    type: Sequelize.STRING(33 * 1000 - 1) // 1000x MD5 hashes w/ delimiters
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal("NOW()")
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal("NOW()")
                }
            })
            .then(() => queryInterface.addIndex("Galleries", ["uuid"])),
    down: (queryInterface, Sequelize) => queryInterface.dropTable("Galleries")
};
