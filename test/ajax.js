'use strict';
 
var should = require('chai').should(),
    sinon = require('sinon'),
    ajax = require('../lib/ajax');

describe('#ajax', function() {
    beforeEach(function() {
        this.xhr = sinon.useFakeXMLHttpRequest();

        this.requests = [];
        this.xhr.onCreate = function(xhr) {
            this.requests.push(xhr);
        }.bind(this);
    });

    afterEach(function() {
        this.xhr.restore();
    });

    it('GET to valid end point returns json', function() {
        var promise = ajax.get('/users');

        promise.then(function handleGetUsers(users) {
            console.log(users);
            users.should.equal('oh hai');
        })
        .fail(function handleGetUsersFailed(error) {
            console.log(users);
        });
    });
});
