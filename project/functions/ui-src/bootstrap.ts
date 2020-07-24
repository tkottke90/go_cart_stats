import './app/index';
import { Router } from './app/router';
import { routes } from './bootstrap.routes';

import FirebaseService from './app/services/firebase.service';

(async () => {
  try {
    await FirebaseService.init();
  } catch (err) {
    console.dir(err);
    return;
  }

  if ('serviceWorker' in navigator && false) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) { return; }

        refreshing = true;
        window.location.reload();
      }
    );

    // navigator.serviceWorker.register('service-worker.js');
  }

  Router.init(routes);
})();