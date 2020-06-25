"use strict";
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable("Assets", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            gfsId: {
                allowNull: false,
                type: Sequelize.STRING(32),
                unique: true
            },
            filename: {
                type: Sequelize.STRING
            },
            width: {
                type: Sequelize.INTEGER
            },
            height: {
                type: Sequelize.INTEGER
            },
            contentType: {
                type: Sequelize.STRING
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
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("Assets");
    }
};
