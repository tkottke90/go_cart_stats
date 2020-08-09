import { IContext } from '../interfaces/routing.interfaces';
import * as _ from 'lodash';

import { ROLES } from '../constants';

export default function (level = ROLES.ADMIN) {
  return async (context: IContext) => {
    if (!context.user && level > ROLES.USER) {
      context.error = new Error('Forbidden');
      context.error._code = 403;
      return context;
    }

    console.dir(context.user);

    const userRole = _.get(context.user, 'customClaims.role', ROLES.USER);

    if (userRole > level) {
      context.error = new Error('Forbidden');
      context.error._code = 403;
    }
    

    return context;
  };
}