import { config } from '@keystatic/core';
import { teamCollection } from './src/keystatic/team';
import { globalSettings } from './src/keystatic/globalSettings';
import { vehicles } from './src/keystatic/vehicles';
import { landingPage } from '@/keystatic/landingPage';
import { chronicle } from '@/keystatic/chronicle';
import { commanders } from '@/keystatic/commanders';

export default config({
    storage: {
        kind: 'local',
    },

    singletons: {
        settings: globalSettings,
        landingPage: landingPage,
    },

    collections: {
        vehicles: vehicles,
        team: teamCollection,
        chronicle: chronicle,
        commanders: commanders,
    },
});
