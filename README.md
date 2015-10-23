# Basic-Ajax

A small and simple module wrapping the xhr (XMLHttpRequest) object.

This module's functions (GET, POST, PUT, PATCH and DELETE) returns a promise (https://promisesaplus.com/.)

The module will return a JSON formatted response body as a property of the response object if the response Content-Type is "application/json".

It provides JSON "happy" methods to make it easier to work with getting and sending JSON data. (See Usage below for more details.)

It also provides a `postFormUrlEncoded()` method so you can pass the POST a vanilla JSON object and it will be serialised into a form url encoded body if you need to POST in this format.

## Installation
  
    npm install basic-ajax

## Usage

Require the object:

    var ajax = require('basic-ajax');
    
### GET's
    
Just need to do a get? it's as simple as passing in the url:

    var promise = ajax.get('/users');
    
Just need to do a get and expect JSON back? Call getJson and it will set the "Accept" header correctly:

    var promise = ajax.getJson('/users');

Want to tell the server you accept xml or something else not JSON? Just set the "Accept" header manually:

    var promise = ajax.get('/users', {"Accept": "application/xml"});

You can of course set any headers you like:

    var promise = ajax.get('/users', {"Accept": "application/json", "Origin": "http://somedomain.com"});
    
Okay, so you are expecting JSON back? it's already parsed for you into a "json" property:

    promise.then(function handleGetUsers(response) {
        console.log("list of users:");

        for(var index = 0; index < response.json.length; index++) {
          console.log(response.json[index].name);
        }
    })

### POST's, PUT's and PATCH's

Want to POST, PUT or PATCH some JSON? Just call the equivalent "JSON" method and pass in your object:
We will set the content type header correctly for you and json stringify the object passed in.
    
    var promise = ajax.postJson('/users/add', {"name": "Nick", "age": 18});
    var promise = ajax.putJson('/users/1', {"name": "Nick", "age": 18});
    var promise = ajax.patchJson('/users/1', {"op": "replace", "path": "/age", "value": 21});
    
If you already have your JSON as a string, just pass in a string and we won't attempt to stringify it!

    var promise = ajax.postJson('/users/add', '{"name": "Nick", "age": 18}');
    
POSTing, PUTting or PATCHing something that isn't JSON? Want to set your own headers? Just use the base `post()`, `put()` or `patch()` methods and set the headers using a JSON object:

    var promise = ajax.post('/users/add', {"Content-Type": "application/xml"}, "<person><name>Nick</name><age>18</age></person>");
    
### POSTing bodies in form-url-encoded format

Just use the `postFormUrlEncoded()` method and pass in a JSON object:

    var promise = ajax.postFormUrlEncoded('/users/add', {"name": "Nick", "age": 12});
    
Note: This currently only works on a "shallow" object, ie. a JSON object that is just a set of name/ value pairs - no deep object graph or arrays. Pull requests accepted or let me know if you want this expanded on!

### DELETE's

You can make a DELETE call by calling the `delete()` method:

    var promise = ajax.delete('/users/nick');

### Response Headers:

Do you wanna see wot response headers you got?  Just check da .headers object!
Say you get 2 response headers: "Content-Type" and "Location", just get them like this:

    ajax.get('/').then(function(response) {
        console.log(response.headers.Location);
        console.log(response.headers['Content-Type']);
    });

## Tests

    npm test

