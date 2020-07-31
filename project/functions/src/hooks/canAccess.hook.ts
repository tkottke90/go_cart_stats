import { IContext } from '../interfaces/routing.interfaces';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

import { ROLES } from '../constants';

export default function (level = ROLES.ADMIN) {
  return async (context: IContext) => {
    const cookie = _.get(context, 'request.cookies.session', '');
    const decodedToken = jwt.decode(cookie);

    const userRole = _.get(decodedToken, 'customClaims', ROLES.USER);

    if (userRole !== level) {
      context.error = new Error('Forbidden');
      context.error._code = 403;
      return context;
    }
    

    return context;
  };
}