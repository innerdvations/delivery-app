# Truck Tracker Plugin Tutorial

This guide will walk you through building a Strapi plugin to track delivery trucks in real time. We'll cover every step, from setting up the app to creating a custom map widget in the admin panel. All code snippets are provided exactly as used in the project.

---

## 1. Clone the App

First, clone the starter code from this repo and set up your environment. This gives you a working Strapi app to build on.

```
git clone https://github.com/innerdvations/delivery-app
cp .env.example .env
yarn install
yarn develop
```

---

## 2. Create the Plugin

We'll use Strapi's CLI to scaffold a new plugin called `truck-tracker`. This plugin will handle all truck tracking features.

```
npx @strapi/sdk-plugin init src/plugins/truck-tracker
✔ plugin name … truck-tracker
✔ plugin display name … Truck Tracker
✔ plugin description … Track Trucks!
✔ plugin author name … xxx
✔ plugin author email … xxx
✔ git url … xxx
✔ plugin license … MIT
✔ register with the admin panel? … yes
✔ register with the server? … yes
✔ use editorconfig? … yes
✔ use eslint? … yes
✔ use prettier? … yes
✔ use typescript? … yes
```

After running the CLI, add the plugin to your `config/plugins.ts`:

```tsx
export default () => ({
  'truck-tracker': {
    enabled: true,
    resolve: 'src/plugins/truck-tracker',
  },
});
```

You should now see "Truck Tracker" in the Strapi admin sidebar.

---

## 3. Create the Truck Content Type

We'll create a collection type for trucks that will store each truck's information and location. The schema includes:

- `identifier`: A unique identifier for each truck (like a license plate number)
- `model`: The truck's model, restricted to a predefined list of options
- `position`: GPS coordinates stored as a JSON object with latitude and longitude
- `positionUpdatedAt`: A timestamp for when the position was last updated
- `key`: A private key used for secure position updates from GPS devices

Note that this content type will be referenced as `plugin::truck-tracker.truck` in the code, not `api::truck.truck`. This is because it's part of our plugin rather than the main API.

Create `content-types/truck.ts` in your plugin:

```tsx
export default {
  schema: {
    kind: 'collectionType',
    collectionName: 'trucks',
    info: {
      singularName: 'truck',
      pluralName: 'trucks',
      displayName: 'Delivery Truck',
      description: '',
    },
    // Specify where plugin-created content types are visible in the Strapi admin
    pluginOptions: {
      'content-manager': {
        visible: true,
      },
      'content-type-builder': {
        visible: false,
      },
    },
    attributes: {
      // how a truck identifies itself, like a license plate number
      identifier: {
        type: 'string',
        required: true,
      },
      // model of truck
      model: {
        type: 'enumeration',
        required: true,
        enum: ['Toyota Corolla', 'Toyota RAV4', 'Ford F-Series', 'Honda CR-V', 'Dacia Sandero'],
      },
      // gps coordinates in the form { latitude, longitude }
      position: {
        type: 'json',
        required: true,
      },
      // timestamp for when a truck was last updated
      positionUpdatedAt: {
        type: 'datetime',
      },
      // password-like key for each truck to be able to update its position
      key: {
        type: 'string',
        required: true,
        private: true,
      },
    },
  },
};
```

Add it to your plugin's content-types index:

```
import truck from './truck';

export default {
  truck,
};
```

Run `yarn watch` (and restart `yarn develop` if needed) to see the new content type in the admin.

---

## 4. Add a GeoPicker for Admin Location Updates

The GeoPicker component will need to:

- Shows a map centered on the current position
- Allows clicking to set a new position
- Displays the current latitude and longitude
- Updates the truck's position in the database

We'll use [React Leaflet](https://react-leaflet.js.org/) to let admins pick a truck's location on a map.

Install the dependencies (inside the plugin directory):

```
yarn add leaflet@1.9.4 react-leaflet@4.2.1
yarn add --dev @types/leaflet@1.9.4 @types/react-leaflet
```

Create `GeoPicker.tsx` in `plugins/truck-tracker/admin/src/components/GeoPicker.tsx`:

```tsx
import { Box, Field, Flex, Typography } from '@strapi/design-system';
import React, { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

// #region Types and Styles
interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface GeoPickerProps {
  name: string;
  onChange: (event: { target: { name: string; value: object; type: string } }) => void;
  value?: GeoPosition;
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

interface MapEventsProps {
  onLocationSelected: (lat: number, lng: number) => void;
}

// Styles
const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  margin-bottom: 16px;

  .leaflet-container {
    z-index: 0;
    height: 100%;
    width: 100%;
    border-radius: 4px;
  }
`;
// #endregion

// Map Events Component
const MapEvents: React.FC<MapEventsProps> = ({ onLocationSelected }) => {
  useMapEvents({
    click: (e: any) => {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

// Default position (Paris)
const DEFAULT_POSITION: GeoPosition = {
  latitude: 48.8854611,
  longitude: 2.3284453,
};

const GeoPicker: React.FC<GeoPickerProps> = ({ name, onChange, value, intlLabel, required }) => {
  const [position, setPosition] = useState<GeoPosition>(() => {
    try {
      return value ?? DEFAULT_POSITION;
    } catch {
      return DEFAULT_POSITION;
    }
  });

  const handlePositionChange = (lat: number, lng: number) => {
    const newPosition = {
      latitude: lat,
      longitude: lng,
    };

    setPosition(newPosition);

    onChange({
      target: {
        name,
        value: newPosition,
        type: 'json',
      },
    });
  };

  return (
    <Field.Root name={name} required={required}>
      <Field.Label>{intlLabel?.defaultMessage ?? 'Location'}</Field.Label>
      <Box padding={4}>
        <MapWrapper>
          <MapContainer center={[position.latitude, position.longitude]} zoom={20} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.latitude, position.longitude]} />
            <MapEvents onLocationSelected={handlePositionChange} />
          </MapContainer>
        </MapWrapper>

        <Flex gap={4}>
          <Typography>Latitude: {position.latitude}</Typography>
          <Typography>Longitude: {position.longitude}</Typography>
        </Flex>
      </Box>
      <Field.Error />
      <Field.Hint />
    </Field.Root>
  );
};

export default GeoPicker;
```

Register the custom field with the server in `server/src/register.ts`:

```tsx
// Register the custom field
strapi.customFields.register({
  name: 'geo-picker',
  type: 'json',
});
```

Register it in the plugin admin `index.ts`:

```tsx
import { PinMap } from '@strapi/icons';
import GeoPicker from './components/GeoPicker';

  register(app: StrapiApp) {
  // ...

    app.customFields.register({
      name: 'geo-picker',
      type: 'json',
      icon: PinMap,
      intlLabel: {
        id: 'custom.fields.geo-picker.label',
        defaultMessage: 'Geo Position',
      },
      intlDescription: {
        id: 'custom.fields.geo-picker.description',
        defaultMessage: 'Enter geographic coordinates',
      },
      components: {
        Input: () => ({ default: GeoPicker as React.ComponentType }) as any,
      },
    });

// ...
```

Update the truck schema to use the custom field:

```tsx
      position: {
        type: 'customField',
        customField: 'global::geo-picker',
        required: true
      },
```

If the map doesn't display, you may need to update your Content Security Policy in `config/middlewares.ts`:

```tsx
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
```

---

## 5. Create a Widget to Display Truck Locations

We'll create a dashboard widget that shows all trucks on a map. This widget will:

- Display a map centered on the average position of all trucks
- Shows markers for each truck
- Provides popups with truck information
- Includes links to edit truck details
- Updates automatically when truck positions change

Create `src/admin/widget-map.tsx`:

```tsx
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

// # region Types and Styles
// Styled components
const MapWrapper = styled.div`
  height: 100%;
  width: 100%;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 4px;
  }
`;
// #endregion

// Default position (Paris)
const DEFAULT_POSITION = [48.8854611, 2.3284453] as [number, number];

const MapWidget: React.FC = () => {
  return (
    <MapWrapper>
      <MapContainer center={DEFAULT_POSITION} zoom={20} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </MapWrapper>
  );
};

export { MapWidget };
```

Register the widget in `src/admin/app.tsx`:

```tsx
import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { PinMap, Globe } from '@strapi/icons';
import { MapWidget } from './widget-map';
import GeoPicker from './components/GeoPicker';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.customFields.register({
      name: 'geo-picker',
      type: 'json',
      icon: PinMap,
      intlLabel: {
        id: 'custom.fields.geo-picker.label',
        defaultMessage: 'Geo Position',
      },
      intlDescription: {
        id: 'custom.fields.geo-picker.description',
        defaultMessage: 'Enter geographic coordinates',
      },
      components: {
        Input: () => ({ default: GeoPicker as React.ComponentType }) as any,
      },
    });

    // ADD THIS
    app.widgets.register({
      icon: Globe,
      title: {
        id: `${PLUGIN_ID}.mywidget.title`,
        defaultMessage: 'Trucks Live Tracker',
      },
      component: () => Promise.resolve(MapWidget),
      pluginId: PLUGIN_ID,
      id: 'mywidget',
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
```

Enable the widget API in `config/features.ts`:

```tsx
module.exports = ({ env }) => ({
  future: {
    unstableWidgetsApi: true,
  },
});
```

---

## 6. Create an Admin Route to Get Truck Info

We'll add an admin API route to fetch all truck positions for the dashboard widget.

Add this method to the truck controller:

```tsx
import { Core } from '@strapi/strapi';

const truck = ({ strapi }: { strapi: Core.Strapi }): Core.Controller => ({
  async getTruckPositions(ctx) {
    const trucks = await strapi
      .documents('plugin::truck-tracker.truck')
      // Only select the necessary fields in the query
      .findMany({ fields: ['identifier', 'model', 'position', 'positionUpdatedAt'] });

    return ctx.send(trucks);
  },
});

export default truck;
```

Export the controller from the controllers/index.ts file:

```tsx
import controller from './controller';
import truck from './truck';

export default {
  controller,
  truck,
};
```

Create file `plugins/truck-tracker/server/src/routes/admin-api.ts`:

```tsx
export default [
  {
    method: 'GET',
    // this will appear at localhost:1337/truck-tracker/truck-positions
    path: '/truck-positions',
    handler: 'truck.getTruckPositions',
    config: {
      policies: [],
      auth: false,
    },
  },
];
```

In `plugin/truck-tracker/server/src/routes/index.ts` we need to add the admin routes:

```tsx
import contentAPIRoutes from './content-api';
import adminAPIRoutes from './admin-api';

const routes = {
  'content-api': {
    type: 'content-api',
    routes: contentAPIRoutes,
  },
  'admin-api': {
    type: 'admin',
    routes: adminAPIRoutes,
  },
};

export default routes;
```

You can test this with:

```
npx ts-node ./scripts/get-truck-positions.ts
```

> For simplicity, we leave this route unprotected for now. In production, you should add authentication.

---

## 7. Call the Admin Route from the Widget

Update the MapWidget component to fetch and display truck data:

```tsx
import { Link } from '@strapi/design-system';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

// #region Types & Styles
type GeoPosition = [latitude: number, longitude: number];

interface GeoPickerInputProps {
  name: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  values?: Truck[];
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

interface Truck {
  identifier: string;
  documentId: string;
  name: string;
  model: string;
  position: {
    latitude: number;
    longitude: number;
  };
}

interface MapEventsProps {
  onLocationSelected: (latitude: number, longitude: number) => void;
}

// Styled components
const MapWrapper = styled.div`
  height: 100%;
  width: 100%;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 4px;
  }
`;

// #endregion

// Default position (Paris)
const DEFAULT_TRUCKS: Truck[] = [
  {
    documentId: 'ABC',
    identifier: '123-ABC',
    position: { latitude: 48.8854611, longitude: 2.3284453 },
    name: 'Bob',
    model: 'Corolla',
  },
];

const barycenter = (trucks: Truck[]): GeoPosition => {
  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  const points = trucks.map((truck) => truck.position);

  return [avg(points.map((p) => p.latitude)), avg(points.map((p) => p.longitude))];
};

const MapWidget: React.FC<GeoPickerInputProps> = () => {
  const [trucks] = useState<Truck[]>(DEFAULT_TRUCKS);
  const [center] = useState<GeoPosition>(barycenter(trucks));
  const [zoom] = useState<number>(13);

  return (
    <MapWrapper>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trucks.map((truck) => (
          <TruckMarker key={truck.identifier} truck={truck} />
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

// Individual truck marker component
const TruckMarker: React.FC<{ truck: Truck }> = ({ truck }) => {
  const { backendURL } = window.strapi as any;
  const href = `${backendURL}/admin/content-manager/collection-types/plugin::truck-tracker.truck/${truck.documentId}`;

  return (
    <Marker position={[truck.position.latitude, truck.position.longitude]}>
      <Popup className="request-popup">
        <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{truck.name}</h1>
        <p style={{ fontSize: '1rem' }}>{truck.model}</p>
        <Link href={href} target="_blank">
          Open in content manager
        </Link>
      </Popup>
    </Marker>
  );
};

export { MapWidget };
```

Add the HTTP call to fetch truck positions:

```tsx
const [trucks, setTrucks] = useState<Truck[]>(DEFAULT_TRUCKS);
const [center, setCenter] = useState<GeoPosition>(barycenter(trucks));
const [zoom] = useState<number>(13);

useEffect(() => {
  const fetchTruckPositions = async () => {
    try {
      const response = await fetch('/truck-tracker/truck-positions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? data.message ?? 'Failed to fetch truck positions');
      }

      setTrucks(data);
    } catch (error) {
      console.error('Error fetching truck positions:', error);
    }
  };

  fetchTruckPositions().then();
}, []);

useEffect(() => {
  if (trucks.length > 0) {
    const center = barycenter(trucks);
    setCenter(center);
  }
}, [trucks]);
```

---

## 8. Create Endpoint for GPS Device

We'll create a secure endpoint that allows GPS devices to update truck positions. This endpoint:

- Accepts POST requests with truck identifier and coordinates
- Verifies the truck exists
- Updates only the position data
- Returns the updated position and timestamp

For security, we'll add a policy that verifies a secret key for each truck. This ensures that only authorized devices can update positions. In a production environment, you might want to use a more sophisticated authentication method like TOTP (Time-based One-Time Password).

In `plugins/truck-tracker/server/src/controllers/controller.ts`:

```tsx
// ...

// add : Core.Controller to controller types
const controller = ({ strapi }: { strapi: Core.Strapi }): Core.Controller => ({

 // ...

  async updateTruckPosition(ctx) {
    const { identifier, latitude, longitude } = ctx.request.body;

    // Get the truck
    const truck = await strapi.documents('plugin::truck-tracker.truck').findFirst({
      filters: { identifier },
    });

    if (!truck) {
      return ctx.notFound('Truck not found');
    }

    const updatedTruckPosition = await strapi.documents('plugin::truck-tracker.truck').update({
      documentId: truck.documentId,
      data: {
        position: {
          latitude,
          longitude,
        },
      } as any,
    });

    return {
      data: {
        identifier: updatedTruckPosition.identifier,
        position: updatedTruckPosition.position,
        positionUpdatedAt: updatedTruckPosition.positionUpdatedAt,
      },
    };
  },

// ...
```

In `plugins/truck-tracker/server/src/routes/content-api.ts`:

```tsx
export default [
  {
    method: 'POST',
    path: '/update-position',
    // name of the controller file & the method.
    handler: 'controller.updateTruckPosition',
    config: {
      policies: [],
      auth: false,
    },
    auth: false,
  },
];
```

Test it out:

```
npx ts-node ./scripts/update-truck-position.ts ABC 52.4 13.4 123
```

---

## 9. Add Custom Policy to Verify the Key

We'll add a policy to secure the position update endpoint. This policy:

- Extracts the truck identifier and key from the request
- Looks up the truck in the database
- Verifies that the provided key matches the truck's key
- Only allows the update if the key is correct

This provides a simple but effective security layer. You can test it by trying to update a position with both correct and incorrect keys.

In `plugins/truck-tracker/server/src/policies/index.ts`:

```tsx
import { Core } from '@strapi/strapi';

export default {
  'verify-truck-key': async (
    policyContext: Core.PolicyContext,
    _config: unknown,
    { strapi }: { strapi: Core.Strapi }
  ) => {
    const { identifier, key } = policyContext.request.body;

    const truck = await strapi.documents('plugin::truck-tracker.truck').findFirst({
      filters: { identifier },
    });

    return truck?.key === key;
  },
};
```

Add it to the route:

```tsx
// ...
export default [
  {
    method: 'POST',
    path: '/update-position',
    handler: 'controller.updateTruckPosition',
    config: {
      policies: ['verify-truck-key'],
      auth: false,
    },
    auth: false,
  },
];
```

Test with a wrong key (should fail):

```
npx ts-node ./scripts/update-truck-position.ts ABC 52.4 13.4 wrong
```

And with the correct key (should succeed):

```
npx ts-node ./scripts/update-truck-position.ts ABC 52.4 13.4 123
```

---

## 10. Add Document Service Middleware

We'll add middleware to automatically update the `positionUpdatedAt` timestamp. This middleware:

- Triggers only when a truck's position is updated
- Compares the new position with the old one
- Updates the timestamp only if the position actually changed
- Works for both admin updates and GPS device updates

This optimization ensures that the timestamp only updates when necessary, making it more accurate for tracking position changes.

In `plugins/truck-tracker/server/src/register.ts`:

```tsx
import type { Core } from '@strapi/strapi';

interface Position {
  latitude: number;
  longitude: number;
}

interface TruckData {
  position?: Position;
  positionUpdatedAt?: string;
}

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register the custom field
  strapi.customFields.register({
    name: 'geo-picker',
    type: 'json',
  });

  strapi.documents.use(async (context, next) => {
    if (context.uid === 'plugin::truck-tracker.truck' && context.action === 'update') {
      const { data } = context.params as { data: TruckData };

      const originalData = (await strapi
        .documents('plugin::truck-tracker.truck')
        .findOne({ documentId: context.params.documentId })) as TruckData;

      const { position: newPos } = data;
      const { position: oldPos } = originalData;

      // Only update if coordinates have actually changed
      if (newPos?.latitude !== oldPos?.latitude || newPos?.longitude !== oldPos?.longitude) {
        data.positionUpdatedAt = new Date().toISOString();
      }
    }

    return next();
  });
};

export default register;
```

Demonstrate that the position timestamp now updates when you save in the admin AND when you run the update script… but not when the position stays the same.

---

## Done!

You now have a fully functional truck tracker plugin for Strapi! The plugin includes:

- A custom content type for trucks
- An interactive map for setting truck positions
- A dashboard widget showing all trucks
- A secure API for GPS devices to update positions
- Automatic timestamp updates for position changes

You can test the complete system by:

1. Creating a truck in the admin panel
2. Setting its position using the map
3. Updating its position using the GPS device endpoint
4. Watching the changes appear in the dashboard widget
