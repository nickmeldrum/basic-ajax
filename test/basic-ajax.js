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

    it('200 on patch resolves the promise', function(done) {
        this.server.respondWith('PATCH', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.patch('/', { 'Content-Type': 'application/json' }, '[]');

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

    it('getting json sets the accept header', function(done) {
        this.server.respondWith('GET', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.getJson('/users/john');
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Accept"].should.startWith("application/json");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting as json sets the content type header', function(done) {
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.postJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting as json stringifies objects passed in as body', function(done) {
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.postJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting as json does not stringify strings passed in as bodyi', function(done) {
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.postJson('/users/john', '{"name": "John Smith", "age": 21}');
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('patching as json sets the content type header', function(done) {
        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.patchJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('patching as json stringifies objects passed in as body', function(done) {
        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.patchJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('patching as json does not stringify strings passed in as bodyi', function(done) {
        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.patchJson('/users/john', '{"name": "John Smith", "age": 21}');
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('putting as json sets the content type header', function(done) {
        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.putJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('putting as json stringifies objects passed in as body', function(done) {
        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.putJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('putting as json does not stringify strings passed in as bodyi', function(done) {
        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.putJson('/users/john', '{"name": "John Smith", "age": 21}');
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('deleting as json sets the content type header', function(done) {
        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.deleteJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('deleting as json stringifies objects passed in as body', function(done) {
        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.deleteJson('/users/john', {"name": "John Smith", "age": 21});
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(function (err) { done(err); })
        .finally(done);

        this.server.respond();
    });

    it('deleting as json does not stringify strings passed in as bodyi', function(done) {
        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        var promise = ajax.deleteJson('/users/john', '{"name": "John Smith", "age": 21}');
        var that = this;

        promise.then(function handleSuccess(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
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

   it('header contains the string ": " and the whole header value is still returned', function(done) {
        this.server.respondWith('GET', '/', [200, {'Header': 'um: um'}, '[]']);

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            response.headers.Header.should.equal('um: um');
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does not send a body if it is a GET', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        var promise = ajax.get('/');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does not send a body if it is a POST but the body is null', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        var promise = ajax.post('/', [], null);

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does not send a body if it is a POST but the body is undefined', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        var promise = ajax.post('/', [], undefined);

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does send a body if a body has been defined', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        var promise = ajax.post('/', undefined, 'a body');

        promise.then(function handleSuccess(response) {
            response.status.should.equal(200);
        })
        .catch(function (err) { done(err); })
        .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('sets the headers to stop caching by default', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['Cache-Control'].should.equal('no-cache');
            xhr.requestHeaders['Pragma'].should.equal('no-cache');
            xhr.requestHeaders['If-Modified-Since'].should.contain('1 Jan 2000');
            xhr.respond();
        });

        var promise = ajax.get('/');

        promise
            .catch(function (err) { done(err); })
            .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does not set the cache headers if we turn allow caching on', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            should.equal(xhr.requestHeaders['Cache-Control'], undefined);
            should.equal(xhr.requestHeaders['Pragma'], undefined);
            should.equal(xhr.requestHeaders['If-Modified-Since'], undefined);
            xhr.respond();
        });

        ajax.allowCaching = true;
        var promise = ajax.get('/');

        promise
            .catch(function (err) { done(err); })
            .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('does not override the cache headers if we have set them manually', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['Cache-Control'].should.equal('nick');
            xhr.requestHeaders['Pragma'].should.equal('nick2');
            xhr.requestHeaders['If-Modified-Since'].should.contain('nick3');
            xhr.respond();
        });

        var promise = ajax.get('/', {'Cache-Control': 'nick', 'Pragma': 'nick2', 'If-Modified-Since': 'nick3'});

        promise
            .catch(function (err) { done(err); })
            .finally(function () { done(); });
        
        this.server.respond();
   });

   it ('sets the requested-with header to ajax', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['X-Requested-With'].should.equal('XMLHttpRequest');
            xhr.respond();
        });

        var promise = ajax.get('/');

        promise
            .catch(function (err) { done(err); })
            .finally(function () { done(); });
        
        this.server.respond();
   });
});
 
