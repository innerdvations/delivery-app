import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { PinMap } from '@strapi/icons';
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
        Input: async () => {
          const component = await import('./components/GeoPicker');
          return { default: component.default as React.ComponentType } as any;
        },
      },
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
