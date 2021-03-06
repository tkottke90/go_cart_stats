import * as express from 'express';
import { logger } from 'firebase-functions';
import Application from './application.class';
import * as _ from 'lodash'

import { IContext, IRoute, IHook } from '../interfaces/routing.interfaces';

interface IOptions {
  routes: IRoute[];
  paginate?: boolean;
}

const unusedRoute = (context: IContext) => {
  context.error = { code: 406, message: 'Method Not Available'};
  return context;
};

abstract class BaseRoute {
  public router: express.Router;
  public routeName: string;
  public paginate: boolean = false;
  protected app: Application;

  private defaults: IRoute[] = [
    { method: 'get', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'post', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'put', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'patch', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'delete', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'options', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] }
  ];

  constructor(app: Application, route: string) {
    this.router = express.Router();
    this.app = app;
    this.routeName = route;
  }

  public setup(options: IOptions) {
    this.paginate = options.paginate || false;

    // Combine input routes with defaults. Filter out duplicate routes, then configure router instance
    [ ...options.routes, ...this.defaults]
      .filter( (route, index, parent) => {
        const first = parent.findIndex( (item) => item.method === route.method && item.path === route.path );
        return first === index;
      })
      .forEach( (route) => this.generateRoute(route));

    this.app.express.use(this.routeName, this.router);
  }

  private processHooks = async function*(context: IContext, hooks: any[]) {
    let index = 0;
    let _context: IContext = context;

    while (index < hooks.length) {
      _context = await hooks[index](_context);
      yield { _context, _hookIndex: index };
      index++;
    }

    return _context;
  };

  public generateRoute(route: IRoute) {
    logger.debug(`Configuring: ${route.method.toUpperCase()} ${this.routeName}${route.path}`);
    this.router[route.method](route.path, async (request: express.Request, response: express.Response) => {
      let context: IContext = {
        request,
        response,
        app: this.app,
        method: request.method,
        params: request.params,
        query: request.query,
        data: request.body,
        user: false
      };

      if (this.app.authentication){
        context.user = request.headers.authorization ? this.app.authentication.getUser(request.headers.authorization.split(' ')[1]) : undefined;
      }

      const _beforeHooks = route.beforeHooks || [];
      const _afterHooks = route.afterHooks || [];
      const _errorHooks = route.errorHooks || [];

      const errorHandler = this.handleError(_errorHooks);

      // Before Hooks
      for await (const hook of this.processHooks(context, _beforeHooks )) {
        const { _context, } = hook;
        context = _context;

        // If there is an error or the result is returned, then
        if (context.error) {
          errorHandler('before', context, response);
          return;
        }

        // If result is set, skip the remaining hooks
        if (context.result) { break; }
      }

      if (!context.result) {
        try {
          context.result = await route.action(context);
        } catch (err) {
          context.error = err;
          errorHandler('action', context, response);
          return;
        }
      }

      // After Hooks
      for await (const hook of this.processHooks(context, _afterHooks )) {
        const { _context, } = hook;
        context = _context;

        // If there is an error or the result is returned, then
        if (context.error) {
          errorHandler('after', context, response);
          return;
        }
      }

      const status = _.get(context, 'result._code', 200);
      delete context.result._code;
      const data = context.result;

      response.status(status).json(data);

    });
  }

  private handleError = (errorHooks: IHook[]) => async (location: 'before' | 'action' | 'after', context: IContext, response: express.Response): Promise<void> => {
    logger.debug('Error handler called ', { error: context.error, method: context.method, step: location });

    let finalContext = context;
    for await (const hook of this.processHooks(context, errorHooks)) {
      const { _context, } = hook;
      finalContext = _context;
    }

    const code = finalContext.error?._code || 500;

    response.status(code).json({ error: finalContext.error });
  }
}

export default BaseRoute;
