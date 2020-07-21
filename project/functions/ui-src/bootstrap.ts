import './app/index';
import { Router } from './app/router';
import { routes } from './bootstrap.routes';

(async () => {
  if ('serviceWorker' in navigator) {
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