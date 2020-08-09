import * as functions from 'firebase-functions';
import { app, firestore, database, auth } from 'firebase-admin';
import * as _ from 'lodash';
import { ROLES } from '../constants';


function generateHexString(length: number) {
  var ret = "";
  while (ret.length < length) {
    ret += Math.random().toString(16).substring(2);
  }
  return ret.substring(0,length);
}

/**
 * Hook triggers when a new user is created.  The application should create a new
 *   document in the 'users' collection in Google Firestore
 */
exports.createUserDocument = (admin: app.App) => functions.auth.user().onCreate(user => {
  const userID = user.uid;

  try {
    const db = admin.firestore();
    const document = db.collection('users').doc(userID);

    const data = {
      experience: 0,
      number: -2,
      rival: '',
    }

    document.set(data);
    functions.logger.info('User document created successfully');

  } catch (err) {
    functions.logger.error('Could not create document for user', err);
  }
  return;
});

export default function (adminSDK: app.App) {
  const documentCreated = functions.firestore.document('/test/user').onCreate(async (change, context) => {
    console.dir('User file updated');

    return true;
  });

  const createUserDocument = functions.auth.user().onCreate(async user => {

    try {
      const db = firestore();
      const document = db.doc(`users/${user.uid}`);

      const data = {
        email: user.email || '',
        new: true,
        id: user.uid,
        displayName: user.displayName || ''
      }

      document.set(data);
      functions.logger.info('User document created successfully');

    } catch (err) {
      functions.logger.error('Could not create document for user', err);
    }
    return;
  });

  const setAdminUsers = functions.https.onRequest(async (req, res) => {
    // functions.pubsub.schedule('every 1 minutes').onRun(async (context: functions.EventContext)
    
    // TODO - Add config key validator to protect route
    const [, accessKey] = req.headers.authorization ? 
      req.headers.authorization.split(' ') :
      [ '', '' ];

    // Get Configuration
    const rtdb = database();
    let config;
    let configRef;
    try {
      configRef = await rtdb.ref('admins').once('value');
      if (configRef.exists()) {
        config = configRef.val();
      } else {
        config = { key: "0", list: ''};
      }
    } catch (err) {
      functions.logger.error('Error getting admins list: ', err.message);
      config = {};
    }

    if (config.key !== accessKey) {
      functions.logger.error('Invalid access key', { timestamp: Date.now(), provided_key: accessKey, configured_key: config.key })
      res.status(401).json({ error: new Error('Invalid Access Key') });
      return;
    }

    const configList: string[] = config.list.split(',');
    const { users } = await auth().listUsers()
    users.forEach( user => {
      console.dir({ user: user.uid, claims: user.customClaims, admin: configList.includes(user.uid) });
      if (configList.includes(user.uid)) {
        auth()
          .setCustomUserClaims(user.uid, { role: ROLES.ADMIN })
          .catch( err => {
            functions.logger.warn(`Error updating custom claims for user: ${user.uid} (${err.message})`);
          });
      } else {
        auth()
          .setCustomUserClaims(user.uid, { role: ROLES.USER })
          .catch( err => {
            functions.logger.warn(`Error updating custom claims for user: ${user.uid} (${err.message})`);
          });
      }
    });


    // TODO - On Success, generate a new key and store in the db
    if (config && configRef) {
      config.key = generateHexString(58)
      configRef.ref.set(config);
    }


    res.status(200).json({ status: 'sucess' });
  });


  return {
    createUserDocument,
    documentCreated,
    setAdminUsers
  }
}