# Strapi Location Field Plugin

This is a plugin for [Strapi](https://strapi.io/) that adds a custom location field. Simply begin typing in a location and select it from an autocomplete dropdown list. The autocomplete functionality is powered by the Google Places API, which requires an API key.

![image](https://user-images.githubusercontent.com/29098307/228688554-9b1f3f01-cad6-4770-9f55-8879322be90c.png)
*Strapi Interface*

![image](https://user-images.githubusercontent.com/29098307/228693688-919181b2-83f6-47c1-9a80-77910bec4969.png)

*API Response*

## Installation

To install this package, run the following command in an existing strapi project:

```sh
npm install strapi-location-field-plugin 
```

## Usage

To enable the plugin, you'll need to include the following code in your Strapi project, in the `/config/plugins.js` file:

```javascript
module.exports = {
  "location-field": {
    enabled: true,
    config: {
      fields: ["photo", "rating"], // optional
      googleMapsApiKey: "your google api key", //You need to enable "Autocomplete API" and "Places API" in your Google Cloud Console
    },
  },
  // .. your other plugin configurations
};
```
> :warning: It is strongly recommended to store your API key using an environment variable and not directly in plugins.js.

Note: the config.fields value can be set to an array of options (strings) containing any fields you'd like to be returned. The options that Google allows can be found [here](https://developers.google.com/maps/documentation/places/web-service/details) or in the screenshot below.  When set, the information relevant to those specific fields will be accessible in the API response under the "details" key.  The "geometry" field is enabled by default.

![image](https://user-images.githubusercontent.com/29098307/228680235-992c95c5-5b22-4ce1-9128-188825831e51.png)

> ℹ️ Please note: some fields may not return the expected response.  Currently only the "photo", "rating", and "geometry" fields have been tested.


You'll also need to modify the `/config/middlewares.js` file

```javascript
module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        directives: { "script-src": ["'self'", "'unsafe-inline'", "maps.googleapis.com"] },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
```

### Additional Information
- This plugin is not affiliated with Google in any way.
- This plugin is still in early development and may not be production-ready
