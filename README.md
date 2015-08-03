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

    // you can post a body as well like this:
    // (adding as many headers as you like)
    var promise = ajax.post('/users/add', {"Accept": "application/json", "Content-Type": "application/json"}, '{"name": "Nick"}');

    // there is also a put and a delete function:
    var promise = ajax.put('/users/nick', {"Accept": "application/json", "Content-Type": "application/json"}, '{"name": "Nick"}');
    var promise = ajax.delete('/users/nick');

    // if you need to post your body in the form-url-encoded format, just use the special method:
    var promise = ajax.postFormUrlEncoded('/users/add', '{"name": "Nick", "age": 12}');

## Tests

    npm test

