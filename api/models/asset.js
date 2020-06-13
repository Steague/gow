"use strict";
module.exports = (sequelize, DataTypes) => {
    const Asset = sequelize.define(
        "Asset",
        {
            gfsId: {
                type: DataTypes.STRING(32)
            },
            filename: {
                type: DataTypes.STRING
            },
            width: {
                type: DataTypes.INTEGER
            },
            height: {
                type: DataTypes.INTEGER
            },
            contentType: {
                type: DataTypes.STRING
            }
        },
        {
            indexes: [{ fields: ["filename"] }]
        }
    );
    Asset.associate = models => {};
    return Asset;
};
