var q = require('q');

module.exports = (function () {
    'use strict';

    var instance = {};

    function ResponseObject(xhr) {
        var ro = {
            response: xhr.response,
            responseText: xhr.responseText,
            responseType: xhr.responseType,
            responseURL: xhr.responseURL,
            responseXML: xhr.responseXML,
            status: xhr.status,
            statusText: xhr.statusText
        };

        if (xhr.status < 300 && xhr.status >= 200) {
            if (xhr.getResponseHeader('content-type').indexOf('application/json') >= 0)
                ro = jsonResponseFormatter(ro);
        }

        return ro;
    }

    function jsonResponseFormatter(responseObject) {
        responseObject.json = JSON.parse(responseObject.responseText);
        return responseObject;
    }

    function shallowObjectToUrlEncoded(json) {
        return Object.keys(json).map(function (prop) {
            return encodeURIComponent(prop) + '=' + encodeURIComponent(json[prop]);
        }).join('&');
    }

    function request(method, url, headers, body) {
        var xhr = new XMLHttpRequest(),
            deferred = q.defer();

        xhr.open(method, url, true);
        if (headers)
            for(var o in headers)
                xhr.setRequestHeader(o, headers[o]);

        xhr.onreadystatechange = function onreadystatechange() {
            var ro;
            if (xhr.readyState != 4) return;
            ro = ResponseObject(xhr);
            if (xhr.status >= 200 && xhr.status < 400) deferred.resolve(ro);
            else deferred.reject(ro);
        };
        xhr.send(body);

        return deferred.promise;
    };

    instance.get = function get(url, headers) {
        return request('GET', url, headers);
    };

    instance.post = function post(url, headers, body) {
        return request('POST', url, headers, body);
    };

    instance.put = function put(url, headers, body) {
        return request('PUT', url, headers, body);
    };

    instance.delete = function put(url, headers, body) {
        return request('DELETE', url, headers, body);
    };

    instance.postFormUrlEncoded = function post(url, jsonBody) {
        return request('POST', url, "application/x-www-form-urlencoded; charset=UTF-8", shallowObjectToUrlEncoded(jsonBody));
    };

    return instance;
})();

