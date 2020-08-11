import {precacheAndRoute} from 'workbox-precaching';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import {registerRoute} from 'workbox-routing';
import {NetworkOnly} from 'workbox-strategies';

//==============================================
//  Pre-caching
//==============================================

precacheAndRoute(self.__WB_MANIFEST);

//==============================================
//  Background Sync
//==============================================

const raceSyncPlugin = new BackgroundSyncPlugin('races_queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

const voteSyncPlugin = new BackgroundSyncPlugin('votes_queue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  /races\//,
  new NetworkOnly({
    plugins: [raceSyncPlugin]
  }),
  'POST'
);

registerRoute(
  /votes\//,
  new NetworkOnly({
    plugins: [voteSyncPlugin]
  }),
  'POST'
);