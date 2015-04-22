Basic-Ajax
===================

A very small and simplistic module for making GET and POST calls. This ajax module will return a q promise, and will provide a json formatted response body in the response object if the response content-type is application/json. It also provides a postFormUrlEncoded method so you can pass the POST a vanilla JS object and it will be serialised into a form url encoded body.

## Installation
  
    npm install basic-ajax

## Usage

    var ajax = require('basic-ajax');

    var promise = ajax.get('/users');

    promise.then(function handleGetUsers(users) {
        console.log(users);
    })
    .fail(function handleGetUsersFailed(error) {
        console.log(users);
    });

## Tests

    npm test

