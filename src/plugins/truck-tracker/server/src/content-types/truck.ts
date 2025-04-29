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
    options: {
      draftAndPublish: false,
    },
    // By default, plugin-created content types are not visible in the Strapi admin
    pluginOptions: {
      'content-manager': {
        visible: true,
      },
      'content-type-builder': {
        visible: true,
      },
    },
    attributes: {
      identifier: {
        type: 'string',
        required: true,
      },
      model: {
        type: 'enumeration',
        required: true,
        enum: ['Toyota Corolla', 'Toyota RAV4', 'Ford F-Series', 'Honda CR-V', 'Dacia Sandero'],
      },
      position: {
        type: 'customField',
        customField: 'global::geo-picker',
      },
      positionUpdatedAt: {
        type: 'datetime',
      },
      key: {
        type: 'string',
        required: true,
        private: true,
      },
    },
  },
};
