# Basic-Ajax

A promisified XMLHttpRequest wrapper with json support, extensibility hooks and fixes to most common xhr issues built in.

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

    ajax.get('/users');
    
Just need to do a get and expect JSON back? Call getJson and it will set the "Accept" header correctly:

    ajax.getJson('/users');

Want to tell the server you accept xml or something else not JSON? Just set the "Accept" header manually:

    ajax.get('/users', {"Accept": "application/xml"});

You can of course set any headers you like:

    ajax.get('/users', {"Accept": "application/json", "Origin": "http://somedomain.com"});
    
Okay, so you are expecting JSON back? it's already parsed for you into a "json" property:

    ajax.getJson('/').then(function(response) {
        console.log("list of users:");

        for(var index = 0; index < response.json.length; index++) {
          console.log(response.json[index].name);
        }
    })

### POST's, PUT's and PATCH's

Want to POST, PUT or PATCH some JSON? Just call the equivalent "JSON" method and pass in your object:
We will set the content type header correctly for you and json stringify the object passed in.
    
    ajax.postJson('/users/add', {"name": "Nick", "age": 18});
    ajax.putJson('/users/1', {"name": "Nick", "age": 18});
    ajax.patchJson('/users/1', {"op": "replace", "path": "/age", "value": 21});
    
If you already have your JSON as a string, just pass in a string and we won't attempt to stringify it!

    ajax.postJson('/users/add', '{"name": "Nick", "age": 18}');
    
POSTing, PUTting or PATCHing something that isn't JSON? Want to set your own headers? Just use the base `post()`, `put()` or `patch()` methods and set the headers using a JSON object:

    ajax.post('/users/add', {"Content-Type": "application/xml"}, "<person><name>Nick</name><age>18</age></person>");
    
### POSTing bodies in form-url-encoded format

Just use the `postFormUrlEncoded()` method and pass in a JSON object:

    ajax.postFormUrlEncoded('/users/add', {"name": "Nick", "age": 12});
    
Note: This currently only works on a "shallow" object, ie. a JSON object that is just a set of name/ value pairs - no deep object graph or arrays. Pull requests accepted or let me know if you want this expanded on!

### DELETE's

You can make a DELETE call by calling the `delete()` method:

    ajax.delete('/users/nick');

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

### Hooks:

You can add pre and post hooks to basic-ajax. Pre hooks fire immediately prior to an `xhr.send()` and post hooks fire after a `load()`, `error()` or `abort()` event has been called.

We provide the function: `ajax.setHooks([ordered, array, of, hooks])` in order to setup your hooks.

A hooks provider should look like this:

    var hook = {
        pre: function (xhr, state) {
          console.log(xhr.method);
        },
        post: function (ro, state) {
          console.log(ro.status);
        }
    };

 * if a pre function returns an object with a `cancel=true` property on it then the `xhr.send()` will not fire and the promise will be immediately resolved returning an object with the `reason` string set to a `reason` string you return from the `pre()` function as well as the xhr object.
 * if a pre function cancels, no other hooks will get run.
 * you can setup either a pre or a post function or both in your hook
 * the state object is for passing state between the pre and post functions.
 * this state is private to each request and private to each hook that is run.
 * We don't currently allow for asynchronous hooks.
 * For more information look at the tests which should act as deeper documentation. 
 
We provide `ajax.addHooks()` to add hooks to the existing chain of hooks set up (whereas `ajax.setHooks` will replace the existing chain.)
We also provide the function `ajax.removeHooks()` which will remove all hooks applied by the mechanisms above.

## Tests

    npm test

