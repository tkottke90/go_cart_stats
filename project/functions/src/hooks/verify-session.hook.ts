import { logger } from 'firebase-functions';
import { IContext } from "../interfaces/routing.interfaces"
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

export default function() {
  return async (context: IContext) => {
    const auth = context.app.admin.auth();
    const cookie = _.get(context, 'request.cookies.__session', '');

    logger.debug('Cookies', { cookie, jar: context.request.cookies, path: context.request.path, method: context.request.method });

    if (!cookie) {
      logger.debug('Cookies - context.request', { request: context.request.rawHeaders });

      context.error = new Error('Missing access token');
      context.error._code = 401;
      return context;
    }

    try {
      await auth.verifySessionCookie(cookie);

      const decodedToken: any = jwt.decode(cookie);
      const user = await context.app.admin.auth().getUser(decodedToken.user_id);

      if (user) {
        context.user = user;
      }

      return context;
    } catch (err) {
      context.error = err;
      context.error._code = 401;
      context.response.clearCookie('__session');
      return context;
    }    
  }
}