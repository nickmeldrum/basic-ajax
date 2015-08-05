'use strict';
 
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
var ajax = require('../lib/basic-ajax');

chai.use(require('chai-string'));

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

    it('sets the content type header', function(done) {
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

    it('sets accept header', function(done) {
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

    it('200 on get resolves the promise', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('200 on post resolves the promise', function(done) {
        this.server.respondWith('POST', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.post('/', { 'Content-Type': 'application/json' }, '[]');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
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

    it('posting form-url-encoded converts a shallow json object of a string and number property to a url-encoded body', function(done) {
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].url.should.equal('/users/john');
            that.server.requests[0].requestBody.should.equal('name=John%20Smith&age=21');
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting form-url-encoded doesn\'t convert a deep property in a json object', function() {
        var postingDeepJsonFunc = function () {
            var promise = ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "details": {"age": 21}});
        };

        postingDeepJsonFunc.should.throw(Error);
    });

    it('posting form-url-encoded sets the content type header', function(done) {
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/x-www-form-urlencoded;");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('response object contains responseText, status and statusText', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.get('/');
        var that = this;

        promise.then(function handleSuccess(response) {
            response.status.should.equal(that.server.requests[0].status);
            response.status.should.equal(200);
            response.statusText.should.equal(that.server.requests[0].statusText);
            response.statusText.should.equal('OK');
            response.responseText.should.equal(that.server.requests[0].responseText);
            response.responseText.should.equal('[]');
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('response object contains json object in response when response content type is json', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '{"name": "Nick"}']);

        var promise = ajax.get('/');
        var that = this;

        promise.then(function handleSuccess(response) {
            response.json.should.eql({"name": "Nick"});
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('response object does not contain json object in response when response content type is not json', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'text/plain' }, '{"name": "Nick"}']);

        var promise = ajax.get('/');
        var that = this;

        promise.then(function handleSuccess(response) {
            should.equal(response.json, undefined);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('response object does not contain json object in response when response content type is empty', function(done) {
        this.server.respondWith('DELETE', '/', [200, {}, '']);

        var promise = ajax.delete('/');
        var that = this;

        promise.then(function handleSuccess(response) {
            should.equal(response.json, undefined);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
    });

    it('returns all headers', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json', 'Location': '/someuri' }, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            response.headers['Content-Type'].should.equal('application/json');
            response.headers['Location'].should.equal('/someuri');
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it('returns no headers if headers is null', function(done) {
        this.server.respondWith('GET', '/', [200, null, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            Object.keys(response.headers).length.should.equal(0);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });
});
 
