import * as functions from 'firebase-functions';
import { app, firestore, database, auth } from 'firebase-admin';
import * as _ from 'lodash';

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
    // const userID = user.uid;

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

    // Get Configuration
    const rtdb = database();
    let config;
    try {
      const configRef = await rtdb.ref('admins').once('value');
      if (configRef.exists()) {
        config = configRef.val();
      } else {
        config = { key: "0", list: ''};
      }
    } catch (err) {
      functions.logger.error('Error getting admins list: ', err.message);
      config = {};
    }

    const configList: string[] = config.list.split(',');
    const { users } = await auth().listUsers()
    users.forEach( user => {
      console.dir({ user: user.uid, claims: user.customClaims, admin: configList.includes(user.uid) });
      if (configList.includes(user.uid) && !_.get(user, 'customClaims.admin', false)) {
        auth()
          .setCustomUserClaims(user.uid, { admin: true })
          .catch( err => {
            functions.logger.warn(`Error updating custom claims for user: ${user.uid} (${err.message})`);
          });
      }

      if (!configList.includes(user.uid) && !!_.get(user, 'customClaims.admin', false)) {
        auth()
          .setCustomUserClaims(user.uid, { admin: false })
          .catch( err => {
            functions.logger.warn(`Error updating custom claims for user: ${user.uid} (${err.message})`);
          });
      }
    });


    // TODO - On Success, generate a new key and store in the db

    res.status(200).json({ status: 'sucess' });
  });


  return {
    createUserDocument,
    documentCreated,
    setAdminUsers
  }
}