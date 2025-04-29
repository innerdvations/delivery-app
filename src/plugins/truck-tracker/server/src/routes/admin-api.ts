export default [
  {
    method: 'GET',
    // this will appear at localhost:1337/truck-tracker/truck-positions
    path: '/truck-positions',
    handler: 'controller.getTruckPositions',
    config: {
      policies: [],
      auth: false,
    },
    auth: false,
  },
];
