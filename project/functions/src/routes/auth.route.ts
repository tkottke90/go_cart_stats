import BaseClass from '../classes/base-route.class';
import Application from '../classes/application.class';
import { IContext } from "../interfaces/routing.interfaces";

import * as _ from 'lodash';

const logError = async (context: IContext) => {

  // console.dir(context);

  return context;
}

class AuthRoute extends BaseClass {

  constructor(app: Application) {
    super(app, '/auth');

    this.setup({
      routes: [
        { method: 'get', path: '/status', action: this.hasSession, errorHooks: [ logError ] },
        { method: 'post', path: '/sessionLogin', action: this.getSession, errorHooks: [ logError ] }
      ]
    });
  }

  public async hasSession(context: IContext) {
    const cookie = _.get(context, 'request.cookies.session', false);

    return { status: !!cookie };
  }

  public async getSession(context: IContext) {
    console.dir(context.data.tokenId);
    const idToken = context.data.tokenId;
    // const csrfToken = context.data.csrfToken;

    // const csrfCookie = _.get(context, 'request.cookies.csrfToken', undefined);

    // if (csrfToken !== csrfCookie) {
    //   context.result._code = 401;
    //   throw new Error('Unauthorized Request!');
    // }

    // Every Day
    const expiresIn = 1000 * 60 * 60 * 24 * 3;

    try {
      const sessionCookie = await context.app.admin.auth().createSessionCookie(idToken, { expiresIn });
      const cookieOptions = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      };

      context.response.cookie('__session', sessionCookie, cookieOptions);
      return { status: 'success' };
    } catch (err) {
      console.error(err);
      context.error = {
        _code: 401
      };
      throw new Error('Unauthorized Request!');
    }
  }
}

exports.initialize = (app: Application) => {
  return new AuthRoute(app);
}