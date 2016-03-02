'use strict'

var Promise = require('bluebird');

var hooks = [];

exports.setHooks = function (newHooks) {
    exports.removeHooks();
    exports.addHooks(newHooks);
};

exports.addHooks = function (newHooks) {
    hooks = hooks.concat(newHooks);
};

exports.removeHooks = function () {
    hooks = [];
};

function responseObject(xhr) {
    var ro = {
        response: xhr.response,
        responseText: xhr.responseText,
        responseType: xhr.responseType,
        responseURL: xhr.responseURL,
        responseXML: xhr.responseXML,
        status: xhr.status,
        statusText: xhr.statusText,
        xhr: xhr
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
    if (responseObject.responseText)
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

function bindOwnStateToEachHook() {
    return hooks.map(function(hook) {
        var hookRequestState = {};
        return {
            pre: function(xhr) {
                if (hook.pre)
                    return hook.pre(xhr, hookRequestState);
                return;
            },
            post: function(ro) {
                if (hook.post)
                    return hook.post(ro, hookRequestState);
                return;
            }
        };
    });
}

function request(method, url, headers, body) {
    return new Promise(function (resolve, reject) {
        var rejected = false;
        var xhr = new XMLHttpRequest();
        var hooksForRequest = bindOwnStateToEachHook();

        function xhrLoaded() {
            var ro = responseObject(xhr);

            for(var i = 0; i < hooksForRequest.length; ++i) {
                var result = hooksForRequest[i].post(ro);
                if (result && result.cancel) {
                    rejected = true;
                    reject(new Error({cancelled: true, reason: result.reason, xhr: xhr}));
                    break;
                }
            }

            if (!rejected) resolve(ro);
        };

        function xhrErrored(err) {
            reject(err);
        };

        function xhrAborted() {
            reject(new Error({cancelled: true, reason: 'aborted', xhr: xhr}));
        };

        xhr.addEventListener("load", xhrLoaded);
        xhr.addEventListener("error", xhrErrored);
        xhr.addEventListener("abort", xhrAborted);

        xhr.open(method, url, true);
        if (headers)
            for(var o in headers)
                xhr.setRequestHeader(o, headers[o]);

        if (!exports.allowCaching) {
            if (!(headers && headers['Cache-Control']))
                xhr.setRequestHeader('Cache-Control', 'no-cache');
            if (!(headers && headers['Pragma']))
                xhr.setRequestHeader('Pragma', 'no-cache');
            if (!(headers && headers['If-Modified-Since']))
                xhr.setRequestHeader('If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT');
        }

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        for(var i = 0; i < hooksForRequest.length; ++i) {
            var result = hooksForRequest[i].pre(xhr);
            if (result && result.cancel) {
                resolve({cancelled: true, reason: result.reason, xhr: xhr});
                break;
            }
        }

        if (method === 'GET' || body === undefined || body === null) xhr.send();
        else xhr.send(body);
    });
};

exports.get = function get(url, headers) {
    return request('GET', url, headers);
};

exports.post = function post(url, headers, body) {
    return request('POST', url, headers, body);
};

exports.patch = function patch(url, headers, body) {
    return request('PATCH', url, headers, body);
};

exports.put = function put(url, headers, body) {
    return request('PUT', url, headers, body);
};

exports.delete = function deleteIt(url, headers, body) {
    return request('DELETE', url, headers, body);
};

exports.getJson = function getJson(url) {
    return exports.get(url, { "Accept": "application/json" });
}

exports.postFormUrlEncoded = function postFormUrlEncoded(url, jsonBody) {
    return request('POST', url, { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, shallowObjectToUrlEncoded(jsonBody));
};

exports.postJson = function postJson(url, body) {
    return exports.post(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
}

exports.patchJson = function patchJson(url, body) {
    return exports.patch(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
}

exports.putJson = function putJson(url, body) {
    return exports.put(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
}

exports.deleteJson = function deleteJson(url, body) {
    return exports.delete(url, { "Content-Type": "application/json" }, (typeof body === "string" ? body : JSON.stringify(body)));
}

