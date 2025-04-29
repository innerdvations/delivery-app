import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('truck-tracker')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
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
  async getTruckPositions(ctx) {
    const truckPositions = await strapi.documents('plugin::truck-tracker.truck').findMany();
    return ctx.send(
      truckPositions.map((truck) => ({
        identifier: truck.identifier,
        model: truck.model,
        documentId: truck.documentId,
        position: truck.position,
        positionUpdatedAt: truck.positionUpdatedAt,
      }))
    );
  },
});

export default controller;
