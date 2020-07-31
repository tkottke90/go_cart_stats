import FirestoreClass from "../classes/firestore.class";
import Application from "../classes/application.class";

import TrackModel from '../models/track.model';
import { IHooksArray } from "../interfaces/routing.interfaces";

import sessionHook from '../hooks/verify-session.hook';
import canAccess from '../hooks/canAccess.hook';

class TrackRoute extends FirestoreClass {

  private beforeHooks: IHooksArray = {
    all: [ sessionHook() ],
    find: [],
    get: [],
    create: [canAccess()],
    update: [canAccess()],
    updateOrCreate: [canAccess()],
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
    super(app, 'tracks');

    this.configure('tracks', TrackModel, { before: this.beforeHooks, after: this.afterHooks, error: this.errorHooks });
  }
}

exports.initialize = (app: Application) => {
  return new TrackRoute(app);
}