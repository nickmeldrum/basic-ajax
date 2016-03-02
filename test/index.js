'use strict';

var Promise = require('bluebird');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
var ajax = require('../lib');

chai.use(require('chai-string'));

describe('#ajax', function() {
    beforeEach(function() {
        this.server = sinon.fakeServer.create();
    });

    afterEach(function() {
        ajax.removeHooks();
        this.server.restore();
    });

    it('200 response executes the "then" promise', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.get('/')
        .then(function (response) { response.status.should.equal(200); })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('500 response executes the "then" promise', function(done) {
        this.server.respondWith('GET', '/', [500, { 'Content-Type': 'application/json' }, '[]']);

        ajax.get('/')
        .then(function(response) { response.status.should.equal(500); })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('aborting request cancels the send and rejects the promise', function(done) {
        this.server.respondWith(function () {
            assert.fail();
        });

        var hook = {
            pre: function(xhr) { xhr.abort(); }
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .then(function() {
            assert.fail();
        })
        .catch(function (err) {
            err.cancelled.should.equal(true);
        })
        .finally(function () {
            ajax.removeHooks();
            done();
        });

        this.server.respond();
    });

    it('sets the content type header', function(done) {
        var that = this;
        this.server.respondWith('POST', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.post('/', { 'Content-Type': 'application/json' }, '{"name": "nick"}')
        .then(function(response) {
            var contentType = that.server.requests[0].requestHeaders['Content-Type'];
            contentType.should.startWith('application/json');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('sets accept header', function(done) {
        var that = this;
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.get('/', { 'Accept': 'application/json' })
        .then(function(response) {
            var accept = that.server.requests[0].requestHeaders['Accept'];
            accept.should.contain('application/json');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('200 on get resolves the promise', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.get('/')
        .then(function(response) { response.status.should.equal(200); })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('200 on post resolves the promise', function(done) {
        this.server.respondWith('POST', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.post('/', { 'Content-Type': 'application/json' }, '[]')
        .then(function(response) { response.status.should.equal(200); })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('200 on patch resolves the promise', function(done) {
        this.server.respondWith('PATCH', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.patch('/', { 'Content-Type': 'application/json' }, '[]')
        .then(function(response) { response.status.should.equal(200); })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('200 on put resolves the promise', function(done) {
        this.server.respondWith('PUT', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.put('/', { 'Content-Type': 'application/json' }, '[]')
        .then(function(response) { response.status.should.equal(200); })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('200 on delete resolves the promise', function(done) {
        this.server.respondWith('DELETE', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.delete('/', { 'Content-Type': 'application/json' }, '[]')
        .then(function(response) { response.status.should.equal(200); })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting form-url-encoded converts a shallow json object of a string and number property to a url-encoded body', function(done) {
        var that = this;
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].url.should.equal('/users/john');
            that.server.requests[0].requestBody.should.equal('name=John%20Smith&age=21');
        })
        .catch(function (err) {done(err); })
        .finally(done);

        this.server.respond();
    });

    it('posting form-url-encoded doesn\'t convert a deep property in a json object', function() {
        var postingDeepJsonFunc = function () {
            ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "details": {"age": 21}});
        };

        postingDeepJsonFunc.should.throw(Error);
    });

    it('posting form-url-encoded sets the content type header', function(done) {
        var that = this;
        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.postFormUrlEncoded('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/x-www-form-urlencoded;");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('getting json sets the accept header', function(done) {
        var that = this;

        this.server.respondWith('GET', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.getJson('/users/john')
        .then(function(response) {
            that.server.requests[0].requestHeaders["Accept"].should.startWith("application/json");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('posting as json sets the content type header', function(done) {
        var that = this;

        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.postJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('posting as json stringifies objects passed in as body', function(done) {
        var that = this;

        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.postJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('posting as json does not stringify strings passed in as body', function(done) {
        var that = this;

        this.server.respondWith('POST', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.postJson('/users/john', '{"name": "John Smith", "age": 21}')
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('patching as json sets the content type header', function(done) {
        var that = this;

        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.patchJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('patching as json stringifies objects passed in as body', function(done) {
        var that = this;

        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.patchJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('patching as json does not stringify strings passed in as body', function(done) {
        var that = this;

        this.server.respondWith('PATCH', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.patchJson('/users/john', '{"name": "John Smith", "age": 21}')
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('putting as json sets the content type header', function(done) {
        var that = this;

        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.putJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('putting as json stringifies objects passed in as body', function(done) {
        var that = this;

        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.putJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('putting as json does not stringify strings passed in as body', function(done) {
        var that = this;

        this.server.respondWith('PUT', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.putJson('/users/john', '{"name": "John Smith", "age": 21}')
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('deleting as json sets the content type header', function(done) {
        var that = this;

        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.deleteJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestHeaders["Content-Type"].should.startWith("application/json");
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('deleting as json stringifies objects passed in as body', function(done) {
        var that = this;

        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.deleteJson('/users/john', {"name": "John Smith", "age": 21})
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name":"John Smith","age":21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('deleting as json does not stringify strings passed in as body', function(done) {
        var that = this;

        this.server.respondWith('DELETE', '/users/john', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.deleteJson('/users/john', '{"name": "John Smith", "age": 21}')
        .then(function(response) {
            that.server.requests[0].requestBody.should.equal('{"name": "John Smith", "age": 21}');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('response object contains responseText, status and statusText', function(done) {
        var that = this;

        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '[]']);

        ajax.get('/')
        .then(function(response) {
            response.status.should.equal(that.server.requests[0].status);
            response.status.should.equal(200);
            response.statusText.should.equal(that.server.requests[0].statusText);
            response.statusText.should.equal('OK');
            response.responseText.should.equal(that.server.requests[0].responseText);
            response.responseText.should.equal('[]');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('response object contains json object in response when response content type is json', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '{"name": "Nick"}']);

        ajax.get('/')
        .then(function(response) {
            response.json.should.eql({"name": "Nick"});
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('response object does not contain json object in response when response content type is not json', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'text/plain' }, '{"name": "Nick"}']);

        ajax.get('/')
        .then(function(response) {
            should.equal(response.json, undefined);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('response object does not contain json object in response when response content type is empty', function(done) {
        this.server.respondWith('DELETE', '/', [200, {}, '']);

        ajax.delete('/')
        .then(function(response) {
            should.equal(response.json, undefined);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('returns all headers', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json', 'Location': '/someuri' }, '[]']);

        ajax.get('/')
        .then(function(response) {
            response.headers['Content-Type'].should.equal('application/json');
            response.headers['Location'].should.equal('/someuri');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('returns no headers if headers is null', function(done) {
        this.server.respondWith('GET', '/', [200, null, '[]']);

        ajax.get('/')
        .then(function(response) {
            Object.keys(response.headers).length.should.equal(0);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('header contains the string ": " and the whole header value is still returned', function(done) {
        this.server.respondWith('GET', '/', [200, {'Header': 'um: um'}, '[]']);

        ajax.get('/')
        .then(function(response) {
            response.headers.Header.should.equal('um: um');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('does not send a body if it is a GET', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        ajax.get('/')
        .then(function(response) {
            response.status.should.equal(200);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('does not send a body if it is a POST but the body is null', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        ajax.post('/', [], null)
        .then(function(response) {
            response.status.should.equal(200);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('does not send a body if it is a POST but the body is undefined', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (!xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        ajax.post('/', [], undefined)
        .then(function(response) {
            response.status.should.equal(200);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('does send a body if a body has been defined', function (done) {
        this.server.respondWith('POST', '/', function(xhr, id) {
            if (xhr.requestBody)
                xhr.respond(200);
            else
                xhr.respond(500);
        });

        ajax.post('/', undefined, 'a body')
        .then(function(response) {
            response.status.should.equal(200);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('sets the headers to stop caching by default', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['Cache-Control'].should.equal('no-cache');
            xhr.requestHeaders['Pragma'].should.equal('no-cache');
            xhr.requestHeaders['If-Modified-Since'].should.contain('1 Jan 2000');
            xhr.respond();
        });

        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('does not set the cache headers if we turn allow caching on', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            should.equal(xhr.requestHeaders['Cache-Control'], undefined);
            should.equal(xhr.requestHeaders['Pragma'], undefined);
            should.equal(xhr.requestHeaders['If-Modified-Since'], undefined);
            xhr.respond();
        });

        ajax.allowCaching = true;
        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('does not override the cache headers if we have set them manually', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['Cache-Control'].should.equal('nick');
            xhr.requestHeaders['Pragma'].should.equal('nick2');
            xhr.requestHeaders['If-Modified-Since'].should.contain('nick3');
            xhr.respond();
        });

        ajax.get('/', {'Cache-Control': 'nick', 'Pragma': 'nick2', 'If-Modified-Since': 'nick3'})
        .catch(done).finally(done);

        this.server.respond();
    });

    it('sets the requested-with header to ajax', function (done) {
        this.server.respondWith('GET', '/', function(xhr, id) {
            xhr.requestHeaders['X-Requested-With'].should.equal('XMLHttpRequest');
            xhr.respond();
        });

        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('a hook applied then its pre and post gets called', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);
        var preCalled = false;
        var postCalled = false;

        var hook = {
            pre: function (xhr) {
                preCalled = true;
            },
            post: function (ro) {
                postCalled = true;
            }
        };

        ajax.setHooks([hook]);

        ajax.get('/').then(function () {
            should.equal(preCalled, true);
            should.equal(postCalled, true);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('a hook applied then its pre gets the xhr and post gets the ro object', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function (xhr) {
                xhr.method.should.equal('GET');
            },
            post: function (ro) {
                ro.status.should.equal(200);
            }
        };

        ajax.setHooks([hook]);

        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('a hook applied then hooks removed will not get run', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function (xhr) {
                should.fail();
            },
            post: function (ro) {
                should.fail();
            }
        };

        ajax.setHooks([hook]);
        ajax.removeHooks();

        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('a hook set then another hook added, then both hooks will get run', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var firstHookRan = false;
        var secondHookRan = false;

        var hook = { pre: function (xhr) { firstHookRan = true; } };
        var hook2 = { pre: function (xhr) { secondHookRan = true; } };

        ajax.setHooks([hook]);
        ajax.addHooks([hook2]);

        ajax.get('/')
        .then(function (ro) {
            should.equal(firstHookRan, true);
            should.equal(secondHookRan, true);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('a hook set then another hook set, then only the second hook will get run', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var firstHookRan = false;
        var secondHookRan = false;

        var hook = { pre: function (xhr) { firstHookRan = true; } };
        var hook2 = { pre: function (xhr) { secondHookRan = true; } };

        ajax.setHooks([hook]);
        ajax.setHooks([hook2]);

        ajax.get('/')
        .then(function (ro) {
            should.equal(firstHookRan, false);
            should.equal(secondHookRan, true);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('2 hooks set then 2 other hooks added, then all 4 will get run in order', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var runOrder = [];

        var hook = { pre: function (xhr) { runOrder.push(1); } };
        var hook2 = { pre: function (xhr) { runOrder.push(2); } };
        var hook3 = { pre: function (xhr) { runOrder.push(3); } };
        var hook4 = { pre: function (xhr) { runOrder.push(4); } };

        ajax.setHooks([hook, hook2]);
        ajax.addHooks([hook3, hook4]);

        ajax.get('/')
        .then(function (ro) { runOrder.should.eql([1,2,3,4]); })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('2 hooks applied then their pre and posts are called in the right order', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var calls = [];

        var hook1 = {
            pre: function (xhr) {
                calls.push(1);
            },
            post: function (ro) {
                calls.push(3);
            }
        };

        var hook2 = {
            pre: function (xhr) {
                calls.push(2);
            },
            post: function (ro) {
                calls.push(4);
            }
        };

        ajax.setHooks([hook1, hook2]);

        ajax.get('/')
        .then(function () {
            calls.should.eql([1,2,3,4]);
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('hook allows state passed from pres to posts', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function (xhr, state) {
                state.someInfo = 'oh wow';
            },
            post: function (ro, state) {
                state.someInfo.should.equal('oh wow');
            }
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .catch(done).finally(done);

        this.server.respond();
    });

    it('hook state is private to each request', function (done) {
        this.server.respondWith('GET', '/first', [200, {}, '']);

        var testString = '';

        var hook1 = {
            pre: function (xhr, state) {
                should.not.exist(state.someInfo);
                state.someInfo = 'oh wow' + xhr.url;
            },
            post: function (ro, state) {
                state.someInfo.should.equal('oh wow' + testString);
            }
        };

        ajax.setHooks([hook1]);

        var that = this;
        testString = '/first';
        ajax.get('/first')
        .then(function () {
            that.server.respondWith('GET', '/second', [200, {}, '']);

            testString = '/second';
            ajax.get('/second').catch(done).finally(done);

            that.server.respond();
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('hook state is private to each hook', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook1 = {
            pre: function (xhr, state) {
                state.someInfo = 'oh wow';
            },
            post: function (ro, state) {
                state.someInfo.should.equal('oh wow');
            }
        };

        var hook2 = {
            pre: function (xhr, state) {
                state.someOtherInfo = 'oh wow2';
            },
            post: function (ro, state) {
                should.not.exist(state.someInfo);
                state.someOtherInfo.should.equal('oh wow2');
            }
        };

        ajax.setHooks([hook1, hook2]);

        ajax.get('/')
        .catch(done).finally(done);

        this.server.respond();
    });

    it('hook only has to declare a pre and can ignore the post', function(done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function(xhr, state) {}
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .catch(done).finally(done);

        this.server.respond();
    });

    it('hook only has to declare a post and can ignore the pre', function(done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            post: function(xhr, state) {}
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .catch(done).finally(done);

        this.server.respond();
    });

    it('pre hook can cancel a request', function(done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function(xhr) {
                return {cancel: true};
            }
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .then(function (obj) {
            if (!obj.cancelled)
                assert.fail('not cancelled', 'cancelled', 'then not passed the cancelled object');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('when pre hook cancels a request, subsequent hook will not run', function(done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function(xhr) {
                return {cancel: true};
            }
        };

        var hook2 = {
            pre: function(xhr) {
                assert.fail('hook2 pre function ran', 'should not have ran', 'the second hook in the chain should not have run');
            }
        };

        ajax.setHooks([hook, hook2]);

        ajax.get('/').catch(done).finally(done);

        this.server.respond();
    });

    it('when pre hook cancels a request, a reason can be returned and the inner xhr is returned by the library', function(done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            pre: function(xhr) { return {cancel: true, reason: 'just because'}; }
        };

        ajax.setHooks([hook]);

        ajax.get('/')
        .then(function (obj) {
            if (!obj.cancelled)
                assert.fail('not cancelled', 'cancelled', 'then not passed the cancelled object');
            obj.reason.should.equal('just because');
            obj.xhr.url.should.equal('/');
        })
        .catch(done).finally(done);

        this.server.respond();
    });

    it('when post hook cancels, the next hooks are not run', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            post: function(xhr) { return {cancel: true, reason: 'just because'}; }
        };
        var hook2 = {
            post: function(xhr) { assert.fail(); }
        };

        ajax.setHooks([hook, hook2]);

        ajax.get('/').then(function () { assert.fail(); }).finally(done);

        this.server.respond();
    });

    it('when post hook cancels, the promise is rejected', function (done) {
        this.server.respondWith('GET', '/', [200, {}, '']);

        var hook = {
            post: function(xhr) { return {cancel: true, reason: 'just because'}; }
        };

        ajax.setHooks([hook]);

        ajax.get('/').then(function() { assert.fail(); }).finally(done);

        this.server.respond();
    });

    it('when response says it is json but response body is blank, the formatter still works', function(done) {
        this.server.respondWith('GET', '/', [200, { 'Content-Type': 'application/json' }, '']);

        ajax.get('/').then(function(obj) {
            window.console.log('info', obj); //jshint ignore:line
        }).finally(done);

        this.server.respond();
    });
});

