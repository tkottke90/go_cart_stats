import * as express from 'express';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';

import * as functions from 'firebase-functions';

export default class Application {
  public express: express.Application;
  public environment: any;
  public authentication: any;

  // Firebase Properties
  public admin: admin.app.App;
  public firestore: admin.firestore.Firestore;
  public rdb: admin.database.Database;
  public storage: admin.storage.Storage;

  constructor(adminApp: admin.app.App) {
    this.express = express();
    this.express.use(cookieParser());
    this.express.use(express.json());
    this.express.use(helmet());

    this.admin = adminApp;
    this.firestore = adminApp.firestore();
    this.rdb = adminApp.database();
    this.authentication = adminApp.auth();
    this.storage = adminApp.storage();

    functions.logger.info('Express App Configured');
  }
}
