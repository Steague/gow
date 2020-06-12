'use strict';
module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        tag: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {
        indexes: [
            {fields: ['tag']}
        ]
    });
    Tag.associate = (models) => {

    };
    return Tag;
};
