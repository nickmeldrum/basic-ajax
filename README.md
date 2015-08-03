# Basic-Ajax

A small and simple module wrapping the xhr (XMLHttpRequest) object.

This module's functions (get, post, put and delete) returns a promise (https://promisesaplus.com/.)

The module will return a json formatted response body as a property of the response object if the response content-type is application/json.

It also provides a postFormUrlEncoded method so you can pass the POST a vanilla JSON object and it will be serialised into a form url encoded body if you need to POST in this format.

## Installation
  
    npm install basic-ajax

## Usage

    // require the object
    var ajax = require('basic-ajax');
    
    // just need to do a get? it's as simple as passing in the url:
    var promise = ajax.get('/users');

    // want to tell the server you want JSON in the response, add the Accept header:
    var promise = ajax.get('/users', {"Accept": "application/json"});

    // okay, so you are expecting json back? it's already parsed for you:
    // (this example is getting an array of users with name as one of the properties)
    promise.then(function handleGetUsers(response) {
        console.log("list of users:");

        for(var index = 0; index < response.json.length; index++) {
            console.log(response.json[index].name);
        }
    })

## Tests

    npm test

