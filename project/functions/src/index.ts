import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Webhooks
import votes from './firebase-hooks/votes';
import users from './firebase-hooks/users';

// Application
import Application from './classes/application.class';
import routes from './routes/index';

const app = new Application(
  admin.initializeApp(functions.config().firebase)
);

routes(app);

// Exports
exports.api = functions.https.onRequest(app.express);
exports.userWebhooks = users(app.admin);
exports.voteWebhooks = votes(app.admin);
