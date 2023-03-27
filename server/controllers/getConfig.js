module.exports = {
    configController: async (ctx) => {
        const config = strapi.config.get("plugin.location-field");
        ctx.send(config);
      },
};