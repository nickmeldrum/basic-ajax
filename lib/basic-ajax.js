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

        ro.headers = headerObjectFromAllResponseHeaders(xhr);

        if (xhr.status < 300 && xhr.status >= 200) {
            if (xhr.getResponseHeader('content-type') && xhr.getResponseHeader('content-type').indexOf('application/json') >= 0)
                ro = jsonResponseFormatter(ro);
        }

        return ro;
    }

    function headerObjectFromAllResponseHeaders(xhr) {
        var headersList = xhr.getAllResponseHeaders().split('\r\n');
        var headers = {};

        for(var index = 0; index < headersList.length; index++) {
            if (headersList[index].length === 0)
                continue;

            var nameValuePair = headersList[index];
            var separatorIndex = nameValuePair.indexOf('\u003a\u0020');

            if (separatorIndex > 0) {
                var key = nameValuePair.substring(0, separatorIndex);
                var val = nameValuePair.substring(separatorIndex + 2);
                headers[key] = val;
            }
        }

        return headers;
    }

    function jsonResponseFormatter(responseObject) {
        responseObject.json = JSON.parse(responseObject.responseText);
        return responseObject;
    }

    function shallowObjectToUrlEncoded(json) {
        var result = Object.keys(json).map(function (prop) {
            return encodeURIComponent(prop) + '=' + encodeURIComponent(json[prop]);
        }).join('&');

        if (result.indexOf('%5Bobject%20Object%5D') > -1)
            throw(Error('error in encoding - possibly your json object has child objects?'));

        return result;
    }

    function request(method, url, headers, body) {
        var xhr = new XMLHttpRequest();
        var deferred = q.defer();

        xhr.open(method, url, true);
        if (headers)
            for(var o in headers)
                xhr.setRequestHeader(o, headers[o]);

        if (!instance.allowCaching) {
            if (!(headers && headers['Cache-Control']))
                xhr.setRequestHeader('Cache-Control', 'no-cache');
            if (!(headers && headers['Pragma']))
                xhr.setRequestHeader('Pragma', 'no-cache');
            if (!(headers && headers['If-Modified-Since']))
                xhr.setRequestHeader('If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT');
        }

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.onreadystatechange = function onreadystatechange() {
            var ro;
            if (xhr.readyState != 4) return;
            ro = ResponseObject(xhr);
            if (xhr.status >= 200 && xhr.status < 400) deferred.resolve(ro);
            else deferred.reject(ro);
        };

        if (method === 'GET' || body === undefined || body === null) xhr.send();
        else xhr.send(body);

        return deferred.promise;
    };

    instance.get = function get(url, headers) {
        return request('GET', url, headers);
    };

    instance.post = function post(url, headers, body) {
        return request('POST', url, headers, body);
    };

    instance.patch = function patch(url, headers, body) {
        return request('PATCH', url, headers, body);
    };

    instance.put = function put(url, headers, body) {
        return request('PUT', url, headers, body);
    };

    instance.delete = function deleteIt(url, headers, body) {
        return request('DELETE', url, headers, body);
    };

    instance.getJson = function getJson(url) {
        return instance.get(url, { "Accept": "application/json" }); 
    }

    instance.postFormUrlEncoded = function postFormUrlEncoded(url, jsonBody) {
        return request('POST', url, { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, shallowObjectToUrlEncoded(jsonBody));
    };

    instance.postJson = function postJson(url, body) {
        return instance.post(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
    }

    instance.patchJson = function patchJson(url, body) {
        return instance.patch(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
    }

    instance.putJson = function putJson(url, body) {
        return instance.put(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
    }

    instance.deleteJson = function deleteJson(url, body) {
        return instance.delete(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
    }
    
    instance.allowCaching = false;

    return instance;
})();

