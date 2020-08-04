import * as functions from 'firebase-functions';
import { app, firestore } from 'firebase-admin';
import * as _ from 'lodash';

/**
 * Hook triggers when a new user is created.  The application should create a new
 *   document in the 'users' collection in Google Firestore
 */
 exports.createUserDocument = (admin: app.App) => functions.auth.user().onCreate( user => {
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

export default function(adminSDK: app.App) {
    const documentCreated = functions.firestore.document('/test/user').onCreate(async ( change, context ) => {
        console.dir('User file updated');

        return true;
    });

    const createUserDocument = functions.auth.user().onCreate( async user => {
        // const userID = user.uid;
    
        try {
            const db = firestore();
            const document = db.doc('users/${docID}');
    
            const data = {
                email: user.email || '',
                new: true,
                id: user.uid,
                displayName: user.displayName
            }
    
            document.set(data);
            functions.logger.info('User document created successfully');
    
        } catch (err) {
            functions.logger.error('Could not create document for user', err);
        }
        return;
    });
    
    return {
      createUserDocument,
      documentCreated
    }
}