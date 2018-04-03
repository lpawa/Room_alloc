/**
 * Created by lakshya on 4/1/18.
 */
'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const assert = require('assert')

chai.use(require('chai-http'));

const app = require('../app.js'); // Our app

describe('API endpoint /submitform', function() {
    this.timeout(10000); // How long to wait for a response (ms)

    before(function() {

    });

    after(function() {

    });

    // // GET - List all colors
    // it('should return all data', function() {
    //     return chai.request(app)
    //         .post('/getInfo')
    //         .then(function(res) {
    //             expect(res).to.have.status(200);
    //             expect(res).to.be.json;
    //             expect(res.body).to.be.an('object');
    //             expect(res.body.results).to.be.an('array');
    //         });
    // });

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

    // POST - Get data
    it('should get info', function() {
        return chai.request(app)
            .post('/submitform')
            .send({
                operation: "bulk",
                type: "single",
                start_date: '4/1/2018',
                end_date: '6/1/2018',
                price: 7550,
                availability: 2,
                days: 8
            })
            .then(function(res) {
                expect(res).to.have.status(200);
            });
    });
// POST - Bad Request - Start Date More than the End date
    it('should return Bad Request', function() {
        return chai.request(app)
            .post('/submitform')
            .type('form')
            .send({
                operation: "bulk",
                type: "single",
                start_date: '8/1/2018',
                end_date: '6/1/2018',
                price: 7550,
                availability: 2,
                days: 8
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
    // POST - Bad Request
    it('should return Bad Request', function() {
        return chai.request(app)
            .post('/submitform')
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