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
