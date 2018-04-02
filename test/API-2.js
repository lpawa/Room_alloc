/**
 * Created by lakshya on 4/2/18.
 */
'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const assert = require('assert')

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app

describe('API endpoint /getInfo', function() {
    this.timeout(10000); // How long to wait for a response (ms)

    before(function() {

    });

    after(function() {

    });


    // GET - Invalid path
    it('should return Not Found', function() {
        return chai.request(app)
            .get('/INVALID_PATH')
            .then(function(res) {
                var err = new Error('Path exists!');
                err.status = 404;
                err.statusCode =404;
                throw err;
            })
            .catch(function(err) {
                expect(err).to.have.status(404);
            });
    });

    // POST - Add new color
    it('should get info', function() {
        return chai.request(app)
            .post('/getInfo')
            .send({
                month:3,
                year:2018
            })
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
                assert.equal(res.body.length, 31, 'Response should contain exactly 31 resources')

            });
    });

    // POST - Bad Request
    it('should return Bad Request', function() {
        return chai.request(app)
            .post('/getInfo')
            .type('form')
            .send({
                color: 'YELLOW'
            })
            .then(function(res) {
                let err =new Error('Invalid content type!');
                err.status=400;
                err.statusCode =400;
                throw err;
            })
            .catch(function(err) {

                expect(err).to.have.status(400);
            });
    });
});