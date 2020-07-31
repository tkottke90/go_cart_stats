import FirestoreClass from "../classes/firestore.class";
import Application from "../classes/application.class";

import UserModel from '../models/users.model';
import { IHooksArray } from "../interfaces/routing.interfaces";

import sessionHook from '../hooks/verify-session.hook';
import canAccess from '../hooks/canAccess.hook';

class UserRoute extends FirestoreClass {

  private beforeHooks: IHooksArray = {
    all: [ sessionHook() ],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: [canAccess()]
  }

  private afterHooks: IHooksArray = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: []
  }

  private errorHooks: IHooksArray = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: []
  }

  constructor(app: Application) {
    super(app, 'users');

    this.configure('users', UserModel, { before: this.beforeHooks, after: this.afterHooks, error: this.errorHooks });
  }
}

exports.initialize = (app: Application) => {
  return new UserRoute(app);
}