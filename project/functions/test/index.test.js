const functions_test = require('firebase-functions-test');
const path = require('path');
const { databaseURL, storageBucket, projectId } = require('../secrets/config.json');

const test = functions_test({
    databaseURL,
    storageBucket,
    projectId
}, path.resolve('./secrets/carousel-karters-v1-06c3c972331d.json'));

const myFunctions = require('../lib/index');