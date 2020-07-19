import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { logger } from 'firebase-functions';

import Application from '../classes/application.class';

const readDir = promisify(fs.readdir);

/**
 * This module is designed to register express http endpoints.  Modules should be loaded into this file with the follwoing syntax:
 *
 *  Module: (app: Application) =>  void
 *
 * This format will allow the application to be passed onto those modules and routers assigned
 *
 * @param app Application instance
 */
export default async function routes(app: Application): Promise<void> {
  app.express.get('/', async (request: express.Request, response: express.Response) => {
    response.status(200).send('OK');
  });

  const directory = await readDir(path.resolve(__dirname));
  const routeFiles = directory.filter( (item) => /.*\.route\.(js|ts)$/.test(item));
  await Promise.all(routeFiles.map( async (file) => {
    logger.info(`Importing Route: ${file}`);
    await import(path.resolve(__dirname, file)).then( (module) => module.initialize(app));
  }));

}