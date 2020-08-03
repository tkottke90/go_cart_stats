import BaseRouteComponet from '../classes/base-route.class';
import Application from "../classes/application.class";

import { IHooksArray, IContext } from "../interfaces/routing.interfaces";

import sessionHook from '../hooks/verify-session.hook';
import canAccess from '../hooks/canAccess.hook';
import { logger } from "firebase-functions";

const test = (context: IContext) => {

  console.log(context.request.path);

  return context;
}

class DailyRoute extends BaseRouteComponet {

  private beforeHooks: IHooksArray = {
    all: [ sessionHook(), test ],
    find: [],
    get: [],
    create: [],
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
    super(app, '/daily');

    this.setup({
      routes: [
        {
          method: 'get',
          path: '/votes',
          action: this.getDailyVotes,
          beforeHooks: [...this.beforeHooks.all, ...this.beforeHooks.get ],
          afterHooks: [...this.afterHooks.all, ...this.afterHooks.get ],
          errorHooks: [...this.errorHooks.all, ...this.errorHooks.get ]
        },
        {
          method: 'post',
          path: '/votes',
          action: this.createDailyVotes,
          beforeHooks: [...this.beforeHooks.all, ...this.beforeHooks.create ],
          afterHooks: [...this.afterHooks.all, ...this.afterHooks.create ],
          errorHooks: [...this.errorHooks.all, ...this.errorHooks.create ]
        },
        {
          method: 'post',
          path: '/toggle-votes',
          action: this.closeVoting,
          beforeHooks: [...this.beforeHooks.all, ...this.beforeHooks.create ],
          afterHooks: [...this.afterHooks.all, ...this.afterHooks.create ],
          errorHooks: [...this.errorHooks.all, ...this.errorHooks.create ]
        }
      ]
    });

  }

  public getDailyVotes(context: IContext) {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date();
        const documentName = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
        const db = context.app.firestore;
        const ref = db.collection('dailyVotes').doc(documentName);

        if (!ref) {
          reject('Missing Model');
        }

        
        const result = await ref.get();
        const data = await result.data();

        if (!data) {
          logger.debug(result);
          reject({ _code: 404 });
        }

        console.dir({
          data,
          documentName
        })
        resolve(data);
      } catch(error) {
        logger.error(error);
        reject({ ...error, _code: 500 })
      }
    });
  }

  public createDailyVotes(context: IContext) {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date();
        const documentName = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
        const db = context.app.firestore;
        const ref = db.collection('dailyVotes').doc(documentName);

        ref.set({
          count: 0,
          votes: [],
          open: true,
          winner: ''
        });

        resolve({ docId: ref.id, _code: 201 });
      } catch(error) {
        logger.error(error);
        reject({ ...error, _code: 500 })
      }
    });
  }

  public closeVoting(context: IContext) {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date();
        const documentName = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
        const db = context.app.firestore;
        const ref = db.collection('dailyVotes').doc(documentName);

        const snap = await ref.get();

        if (!snap.exists) {
          reject({ message: 'Missing document', _code: 404 })
        }

        const data: any = await snap.data();
        ref.update({
          open: !data.open
        });

        resolve({ docId: ref.id, _code: 202 });
      } catch(error) {
        logger.error(error);
        reject({ ...error, _code: 500 })
      }
    });
  }
}

exports.initialize = (app: Application) => {
  return new DailyRoute(app);
}