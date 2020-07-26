import BaseRoute from './base-route.class';
import Application from './application.class';
import { v4 as uuid } from 'uuid';

import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

import { ObjectSchema, object } from '@hapi/joi';
import { IContext, IModelHooks } from '../interfaces/routing.interfaces';

const queryDocument = (collection: admin.firestore.CollectionReference, query: any) => {
  const keys = Object.keys(query);

  if (keys.length > 1) {
    return collection;
  }

  let docAndQuery: admin.firestore.Query | false = false;;
  const equivilanceQueries = keys.filter( item => typeof query[item] !== 'object' );
  const comparisonQueries = keys.filter( item => typeof query[item] === 'object' );

  equivilanceQueries.forEach( item => {
    const queryAble = docAndQuery ? docAndQuery : collection;
    docAndQuery = queryAble.where( item, '==' , query[item] )
  });
  
  comparisonQueries.forEach( item => {
    const opString = Object.keys(query[item])[0];
    const queryAble = docAndQuery ? docAndQuery : collection;

    switch(opString){
      case 'gt':
      docAndQuery = queryAble.where(item, '>', query[item][opString])
        break;
      case 'gte': 
      docAndQuery = queryAble.where(item, '>=', query[item][opString])
        break;
      case 'lt': 
      docAndQuery = queryAble.where(item, '<', query[item][opString])
        break;
      case 'lte': 
      docAndQuery = queryAble.where(item, '<=', query[item][opString])
        break;
      case 'contains': 
      docAndQuery = queryAble.where(item, 'array-contains', query[item][opString])
        break;
      case 'contains-any': 
      docAndQuery = queryAble.where(item, 'array-contains-any', query[item][opString])
        break;
      case 'in': 
      docAndQuery = queryAble.where(item, 'in', query[item][opString])
        break;
    }
  });

  console.log('docAndQuery');
  console.dir(docAndQuery);

  return docAndQuery ? docAndQuery : collection;
}

export default class FirestoreClass extends BaseRoute {
  public Model: ObjectSchema<any> = object(); // Data Validation
  public ModelName: string = '';              // DB Lookup
  private db: admin.firestore.Firestore;

  constructor(app: Application, routeName: string, options?: any) {
    super(app, `/${routeName}`);

   this.db = app.firestore;
  }

  public configure(modelName: string, model: ObjectSchema<any>, modelHook: IModelHooks) {
    this.Model = model;
    this.ModelName = modelName;

    const beforeHooks = modelHook.before;
    const afterHooks = modelHook.after;
    const errorHooks = modelHook.error;

    this.setup({
      routes: [
        { method: 'post', path: '/', action: this.find, beforeHooks: [...beforeHooks.all, ...beforeHooks.get ], afterHooks: [...afterHooks.all, ...afterHooks.get ], errorHooks: [...errorHooks.all, ...errorHooks.get ]},
        { method: 'get', path: '/:id', action: this.get, beforeHooks: [...beforeHooks.all, ...beforeHooks.get ], afterHooks: [...afterHooks.all, ...afterHooks.get ], errorHooks: [...errorHooks.all, ...errorHooks.get ]},
        { method: 'post', path: '/create', action: this.post, beforeHooks: [...beforeHooks.all, ...beforeHooks.create ], afterHooks: [...afterHooks.all, ...afterHooks.create ], errorHooks: [...errorHooks.all, ...errorHooks.create ]},
        { method: 'patch', path: '/:id', action: this.patch, beforeHooks: [...beforeHooks.all, ...beforeHooks.update ], afterHooks: [...afterHooks.all, ...afterHooks.update ], errorHooks: [...errorHooks.all, ...errorHooks.update ]},
        { method: 'put', path: '/:id', action: this.put, beforeHooks: [...beforeHooks.all, ...beforeHooks.updateOrCreate ], afterHooks: [...afterHooks.all, ...afterHooks.updateOrCreate ], errorHooks: [...errorHooks.all, ...errorHooks.updateOrCreate ]},
        { method: 'delete', path: '/:id', action: this.delete, beforeHooks: [...beforeHooks.all, ...beforeHooks.delete ], afterHooks: [...afterHooks.all, ...afterHooks.delete ], errorHooks: [...errorHooks.all, ...errorHooks.delete ]},
      ]
    });
  }

  public find = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      try {
        const ref = this.db.collection(this.ModelName);        
        
        if (!ref) {
          reject('Missing Model');
        }

        const query = queryDocument(ref, context.data);

        const result = await query.get();

        console.dir(JSON.stringify(result));

        const data: any[] = result.docs.map( (doc: admin.firestore.DocumentData) => {
          console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
          return doc.data();
        });


        resolve(data);
      } catch (err) {
        logger.error(err);
        reject({err, _code: 400 });
      }
    })
  }

  public get = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      if (!context.params.id) {
        reject(new Error('Document ID Required'));
      }
      
      try {
        const ref: admin.firestore.DocumentReference = await this.db.doc(`${this.ModelName}/${context.params.id}`)
        const doc: admin.firestore.DocumentSnapshot = await ref.get();

        resolve(await doc.data());
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })
  }

  public post = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      try {

        const modelValidation = this.Model.validate(context.data, { presence: 'required', convert: true });
        if (modelValidation. error) {
          reject({
            message: modelValidation.error.details.map( item => item.message ),
            data: modelValidation.value
          });
          return;
        }

        let id = context.data.id || uuid();
        
        let ref: admin.firestore.DocumentReference = await this.db.doc(`${this.ModelName}/${id}`)
        let docExist = true;
        let tries = 0;
        let MAX_RETRIES = 5;

        while (docExist || tries < MAX_RETRIES) {
          const doc = await ref.get();

          if (!doc.exists) {
            docExist = false;
            break;
          }

          id = uuid();
          ref = await this.db.doc(`${this.ModelName}/${id}`)
          tries++;
        }

        if (tries >= MAX_RETRIES) {
          throw new Error('Unable to create report: Max Retries reached');
        }

        delete context.data.id;
        
        await ref.set(context.data);

        resolve({ _code: 201 });
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })
  }

  public patch = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      try {
        const dataLength = Object.keys(context.data).length;
        const modelValidation = this.Model.validate(context.data, { presence: 'optional', abortEarly: false, convert: true });
        if (modelValidation.error) {
          reject({
            message: modelValidation.error.details.map( item => item.message ),
            data: modelValidation.value
          });
          return;
        }

        if (dataLength === 0) {
          reject({
            message: 'No data provided',
            data: context.data
          });
          return;
        }

        const ref: admin.firestore.DocumentReference = await this.db.doc(`${this.ModelName}/${context.params.id}`)
        await ref.update(context.data);

        const result = await ref.get();

        resolve({ _code: 202, result: await result.data() });
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })
  }

  public put = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      try {
        const modelValidation = this.Model.validate(context.data, { presence: 'required', convert: true });
        if (modelValidation. error) {
          reject({
            message: modelValidation.error.details.map( item => item.message ),
            data: modelValidation.value
          });
          return;
        }

        const ref: admin.firestore.DocumentReference = await this.db.doc(`${this.ModelName}/${context.params.id}`)
        const updateResult: admin.firestore.WriteResult = await ref.update(context.data);

        const result = await ref.get();

        resolve({ _code: 202, updateResult, result });
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })
  }

  public delete = (context: IContext) => {
    return new Promise(async (resolve, reject) => { })
  }

  public options = (context: IContext) => {
    return new Promise(async (resolve, reject) => { })
  }
}