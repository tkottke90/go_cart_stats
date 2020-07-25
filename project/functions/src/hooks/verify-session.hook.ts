import { IContext } from "../interfaces/routing.interfaces"
import * as _ from 'lodash';

export default function() {
  return async (context: IContext) => {
    const auth = context.app.admin.auth();
    const cookie = _.get(context, 'request.cookies.session', '');

    try {
      await auth.verifySessionCookie(cookie, true);
      
      return context;
    } catch (err) {
      context.error = err;
      context.error._code = 401;
      context.response.clearCookie('session');
      return context;
    }    
  }
}