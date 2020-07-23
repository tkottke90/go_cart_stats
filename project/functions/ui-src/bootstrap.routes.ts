// import { redirectInvalidAuthentication } from './app/utilities/authentication-helpers';
import { Route } from './app/util/route';
import { Router } from './app/router';

import authGuard from './app/guards/auth.guard';

const routes: Route[] = [
  new Route({
    icon: 'login',
    label: 'Login',
    path: '/login',
    promise: () => import('./app/pages/login/login'),
    render: true,
    tag: 'login-component'
  }),
  new Route({
    icon: 'home',
    label: 'Home',
    path: '/',
    promise: () => import('./app/pages/home/home'),
    render: true,
    tag: 'home-component',
    before: async (route, context, next) => {
      const allowed = authGuard();
      
      console.dir(allowed);

      if (!allowed) {
        Router.navigate('/login');
        return;
      }

      next();
    }
  })
];

const getRoutes = (pages: Route[]): Route[] => {
  return pages.reduce((prev, curr) => {
    prev.push(curr);
    if (curr.children.length > 0) {
      prev.push(...curr.children);
    }

    return prev;
  }, [] as Route[]);
};

export {
  routes,
  getRoutes
};