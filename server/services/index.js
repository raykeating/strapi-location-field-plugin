"use strict";

module.exports = {
  getConfig: async (ctx) => {
    const config = strapi.config.get("plugin.location-field");
    ctx.send(config);
  },
};
