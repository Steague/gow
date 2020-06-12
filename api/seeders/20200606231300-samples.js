'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('galleries', [
        { id: 1, gallery_name: 'Model 1', gallery_description: 'Model with brown hair' },
        { id: 2, gallery_name: 'Model 2', gallery_description: 'Model with blonde hair' },
        { id: 3, gallery_name: 'Model 3', gallery_description: 'Model with red hair' },
    ], {}),

    down: (queryInterface, Sequelize) => queryInterface.bulkDelete('galleries', null, {})
};
