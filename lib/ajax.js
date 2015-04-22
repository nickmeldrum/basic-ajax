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

    function request(method, url, contentType, body) {
        var r = new XMLHttpRequest(),
            deferred = q.defer();

        r.open(method, url, true);
        if (contentType)
            r.setRequestHeader('Content-Type', contentType);
        r.onreadystatechange = function onreadystatechange() {
            var ro;
            if (r.readyState != 4) return;
            ro = ResponseObject(r);
            if (r.status >= 200 && r.status < 400) deferred.resolve(ro);
            else deferred.reject(ro);
        };
        r.send(body);

        return deferred.promise;
    };

    instance.get = function get(url, contentType) {
        return request('GET', url, contentType, null);
    };

    instance.post = function post(url, contentType, body) {
        return request('POST', url, contentType, body);
    };

    instance.postFormUrlEncoded = function post(url, jsonBody) {
        return request('POST', url, "application/x-www-form-urlencoded; charset=UTF-8", shallowObjectToUrlEncoded(jsonBody));
    };

    return instance;
}

