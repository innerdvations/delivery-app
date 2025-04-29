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
