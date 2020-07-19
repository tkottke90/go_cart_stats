import * as functions from 'firebase-functions';

// Firebase Webhooks
import * as users from './firebase-hooks/users';

// Application
import Application from './classes/application.class';
import routes from './routes/index';

const app = new Application();

routes(app);

// Exports
exports.api = functions.https.onRequest(app.express);
exports.userWebhooks = users;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
