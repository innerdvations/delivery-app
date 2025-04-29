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
      if (newPos.latitude !== oldPos.latitude || newPos.longitude !== oldPos.longitude) {
        data.positionUpdatedAt = new Date().toISOString();
      }
    }

    return next();
  });
};

export default register;
