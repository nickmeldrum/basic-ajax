'use strict';
 
var should = require('chai').should(),
    sinon = require('sinon'),
    ajax = require('../lib/basic-ajax');

describe('#ajax', function() {
    beforeEach(function() {
        this.server = sinon.fakeServer.create();
    });

    afterEach(function() {
        this.server.restore();
    });

    it('200 response executes the "then" promise', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .fail(function handleFail(response) {
            assert.fail('in fail', 'in then', 'ajax executed the "fail" instead of the "then" promise');
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('500 response executes the "fail" promise', function(done) {
        this.server.respondWith('GET', '/', [500, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            assert.fail('in then', 'in fail', 'ajax executed the "then" instead of the "fail" promise');
        })
        .fail(function handleFail(response) {
            response.status.should.equal(500);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('sets the content type header correctly', function(done) {
        this.server.respondWith('POST', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.post('/', { 'Content-Type': 'application/json' }, '{"name": "nick"}');
        var that = this;

        promise.then(function handleSuccess(response) {
            var contentType = that.server.requests[0].requestHeaders['Content-Type'];

        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('sets accept header correctly', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.get('/', { 'Accept': 'application/json' });
        var that = this;

        promise.then(function handleSuccess(response) {
            var accept = that.server.requests[0].requestHeaders['Accept'];
            accept.should.contain('application/json');
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('200 on put resolves the promise', function(done) {
        this.server.respondWith('PUT', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.put('/', { 'Content-Type': 'application/json' }, '[]');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('200 on delete resolves the promise', function(done) {
        this.server.respondWith('DELETE', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.delete('/', { 'Content-Type': 'application/json' }, '[]');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });
});
 
