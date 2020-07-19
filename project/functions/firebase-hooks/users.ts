import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

/**
 * Hook triggers when a new user is created.  The application should create a new
 *   document in the 'users' collection in Google Firestore
 */
exports.createUserDocument = functions.auth.user().onCreate( user => {
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