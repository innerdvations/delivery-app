export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'script-src': ["'self'", 'unsafe-inline', 'https://*.basemaps.cartocdn.com'],
          'media-src': [
            "'self'",
            'blob:',
            'data:',
            'https://*.basemaps.cartocdn.com',
            'https://tile.openstreetmap.org',
            'https://*.tile.openstreetmap.org',
          ],
          'img-src': [
            "'self'",
            'blob:',
            'data:',
            'https://*.basemaps.cartocdn.com',
            'market-assets.strapi.io',
            'https://*.tile.openstreetmap.org',
            'https://unpkg.com/leaflet@1.9.4/dist/images/',
          ],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
