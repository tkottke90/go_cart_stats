// import { redirectInvalidAuthentication } from './app/utilities/authentication-helpers';
import { Route } from './app/util/route';

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
    before: async (route, context, next) => await authGuard(route, context, next)
  }),
  new Route({
    icon: 'new',
    label: 'New-User',
    path: '/new-user',
    promise: () => import('./app/pages/new-user/new-user'),
    render: true,
    tag: 'new-user-component',
    before: async (route, context, next) => await authGuard(route, context, next)
  }),
  new Route({
    icon: 'race',
    label: 'New Race',
    path: '/new-race',
    promise: () => import('./app/pages/new-race/new-race'),
    render: true,
    tag: 'new-race-component',
    before: async (route, context, next) => await authGuard(route, context, next)
  }),
  new Route({
    icon: 'vote',
    label: 'New Vote',
    path: '/new-vote',
    promise: () => import('./app/pages/new-vote/new-vote'),
    render: true,
    tag: 'new-vote-component',
    before: async (route, context, next) => await authGuard(route, context, next)
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