import * as express from 'express';
import * as helmet from 'helmet';

export default class Application {
  public express: express.Application;

  public environment: any;
  
  public authentication: any;

  constructor() {
    this.express = express();
    this.express.use(express.json());
    this.express.use(helmet());
  }
}
