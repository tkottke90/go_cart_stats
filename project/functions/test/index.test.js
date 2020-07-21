const functions_test = require('firebase-functions-test');
const path = require('path');
const { databaseURL, storageBucket, projectId } = require('../secrets/config.json');

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const test = functions_test({
  databaseURL,
  storageBucket,
  projectId
}, path.resolve('./secrets/carousel-karters-v1-06c3c972331d.json'));

const myFunctions = require('../lib/index');
const { expect } = require('chai');

describe('API', function () {
  describe('/users', function () {
    describe('create', function () {
      it('Should reject users without the full model');
      it('Should reject users whose number is not a number');
      it('Should reject users whose experience is not a number');
      it('Should reject users whose rival is not a string');
      it('Should reject users whose userId is not a string');
    });

    describe('get', function() {
      before(async (done) => {
        chaiHttp.request(myFunctions.api)
          .get('/')
          .end(function(err, res) {
            expect(res).to.have.status(201);
          });
      })

      
    })
  });
});