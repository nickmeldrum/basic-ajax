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

### Request Headers:

By default basic-ajax sets the `X-Requested-With` header to `XMLHttpRequest`.
See the reasoning here: http://stackoverflow.com/a/22533680 but basically it allows for the server to prevent CSRF attacks.

Basic-ajax does not allow you to override this setting as that is "A Bad Idea".

### Caching:

By default basic-ajax stops all possible browser caching of ajax calls by setting the `Cache-Control` header to `no-cache`, the `Pragma` header to `no-cache` and the `If-Modified-Since` header to `1 Jan 2000`.
This is to stop Internet Explorer's default behaviour to cache ajax calls. More info here: http://www.dashbay.com/2011/05/internet-explorer-caches-ajax/

If for some reason you want to turn this off you can just execute: `ajax.allowCaching = false`
If for some reason you want to override any of these individual headers, just set them in the headers object you pass in and basic-ajax will use your values instead of it's own.

### Middleware:

You can add pre and post hooks by adding middleware to basic-ajax. Pre hooks fire immediately prior to an `xhr.send()` and post hooks fire in `onreadystatechange()` just before the promise either resolves or rejects.

We provide the function: `ajax.applyMiddlewares([ordered, array, of, middleware])` in order to apply your middleware.

A middleware provider should look like this:

    var middleWare = function () {
        return function (next) {
            return {
                pre: function (xhr) {
                    calls.push(1);
                    return next(xhr);
                },
                post: function (ro) {
                    calls.push(3);
                    return next(ro);
                }
            };
        }
    };

 * You must *always* call `next(arg)` at the end of both the pre and post calls in order for the chain of middlewares to execute.
 * You must *always* implement both pre and post calls even if they just call `next(arg)`.
 * We don't currently allow for asynchronous hooks.
 * We don't have any defensive code against a middleware doing something wrong or strange.
 * For more information look at the tests which should act as deeper documentation. 
 
We also provider the function `ajax.removeMiddlewares()` which will remove any middlewares applied by the mechanism above.

## Tests

    npm test

