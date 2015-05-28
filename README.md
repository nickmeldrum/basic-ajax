Basic-Ajax
===================

A very small and simplistic module for making GET and POST calls. This ajax module will return a q promise, and will provide a json formatted response body in the response object if the response content-type is application/json. It also provides a postFormUrlEncoded method so you can pass the POST a vanilla JS object and it will be serialised into a form url encoded body.

## Installation
  
    npm install basic-ajax

## Usage

    var ajax = require('basic-ajax');
    
    var promise = ajax.get('/users');

        promise.then(function handleGetUsers(response) {
            response.status.should.equal(200);
            response.json[0].name.should.equal('Nick');
        })
        .fail(function handleGetUsersFailed(response) {
            if (response instanceof Error) throw response; // here to handle exceptions in then() function falling through to fail()
            response.status.should.equal(200);
        })
        .catch(function (err) {
            done(err); })
        .finally(function () {
            done();
        });


## Tests

    npm test

