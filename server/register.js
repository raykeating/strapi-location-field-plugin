'use strict';

module.exports = ({ strapi }) => {
  // registeration phase
  strapi.customFields.register({
    name: 'location',
    plugin: 'location-field',
    type: 'json'
  });
};
