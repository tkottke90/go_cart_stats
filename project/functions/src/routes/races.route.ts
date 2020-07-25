import FirestoreClass from "../classes/firestore.class";
import Application from "../classes/application.class";

import RaceModel from '../models/race.model';
import { IHooksArray } from "../interfaces/routing.interfaces";

import sessionHook from '../hooks/verify-session.hook';

class RaceRoute extends FirestoreClass {

  private beforeHooks: IHooksArray = {
    all: [ sessionHook() ],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: []
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
    super(app, 'races');

    this.configure('races', RaceModel, { before: this.beforeHooks, after: this.afterHooks, error: this.errorHooks });
  }
}

exports.initialize = (app: Application) => {
  return new RaceRoute(app);
}