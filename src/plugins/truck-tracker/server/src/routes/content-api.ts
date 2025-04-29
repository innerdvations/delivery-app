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
