"use strict";
module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define(
        "Tag",
        {
            tag: {
                allowNull: false,
                type: DataTypes.STRING
            },
            type: {
                allowNull: false,
                type: DataTypes.ENUM(["default", "model"]),
                defaultValue: "default"
            }
        },
        {
            indexes: [{ fields: ["tag"] }]
        }
    );
    Tag.associate = models => {};
    return Tag;
};
