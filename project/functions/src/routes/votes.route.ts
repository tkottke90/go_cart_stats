import FirestoreClass from "../classes/firestore.class";
import Application from "../classes/application.class";

import VoteModel from '../models/vote.model';
import { IHooksArray } from "../interfaces/routing.interfaces";

class VotesRoute extends FirestoreClass {

  private beforeHooks: IHooksArray = {
    all: [],
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
    super(app, 'votes');

    this.configure('votes', VoteModel, { before: this.beforeHooks, after: this.afterHooks, error: this.errorHooks });
  }
}

exports.initialize = (app: Application) => {
  return new VotesRoute(app);
}