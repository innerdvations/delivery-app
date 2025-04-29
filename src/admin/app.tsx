import type { StrapiApp } from "@strapi/strapi/admin";
import { Globe } from "@strapi/icons";
import { Link } from "@strapi/design-system";

const PLUGIN_ID = "truck";

import { MapWidget } from "./widget-map";

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    console.log("register");
    app.widgets.register({
      icon: Globe,
      title: {
        id: `${PLUGIN_ID}.mywidget.title`,
        defaultMessage: "Trucks Live Tracker",
      },
      component: () => Promise.resolve(MapWidget) as any,
      pluginId: PLUGIN_ID,
      id: "mywidget",
      size: {
        width: 12,
        height: 6,
      },
    });
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
