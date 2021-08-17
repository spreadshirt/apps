/*!
 MIT License
 Copyright (c) 2013 sprd.net AG - Tony Findeisen
 https://github.com/spreadshirt/apps/blob/gh-pages/LICENSE
 */
(function (window, document) {

    var spreadshirt = window.spreadshirt = window.spreadshirt || {},
        applications = {
            sketchomat: Sketchomat,
            smartomat: Smartomat
        },
        supportedLanguages = {
            NA: ["en", "fr"],
            EU: ["de", "dk", "pl", "fi", "en", "fr", "es", "nl", "it", "no", "se"]
        },
        possibleDeeplinks = [
            "designUrl", "designId", "designColor1", "designColor2", "designColor3", "designColorRgb1", "designColorRgb2", "designColorRgb3", "articleId", "productId", "appearanceId", "sizeId", "quantity", "viewId", "productTypeId", "tx1", "tx2", "tx3", "textColorRgb", "textColor", "departmentId", "productTypeCategoryId", "designCategoryId", "designSearch", "perspective", "mode", "panel", "basketId", "basketItemId", "editBasketItemUrl", "shareUrlTemplate", "hideVolumeDiscount", "whiteLabeled", "sellableId"
        ],
        stringifyMessage = isIE();

    stringifyMessage = stringifyMessage && stringifyMessage <= 9;

    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
            'use strict';
            if (this == null) {
                throw new TypeError();
            }
            var n, k, t = Object(this),
                len = t.length >>> 0;

            if (len === 0) {
                return -1;
            }
            n = 0;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

    function track(type, options) {
        var xhr = new XMLHttpRequest();
        var tld = options.platform === 'NA' ? 'com' : 'net';
        var optionsString = '';
        try {
            optionsString = '&options=' + encodeURIComponent(JSON.stringify(options));
        } catch (e) {
            console.error(e);
        }
        var url = 'https://designer.spreadshirt.' + tld + '/tracking/integrations'
            + '?type=' + encodeURIComponent(type)
            + '&host=' + encodeURIComponent(window.location.host)
            + optionsString;
        xhr.open('GET', url, true);
        xhr.send(null);
    }

    /***
     * creates a new instance of the requested application
     *
     * @param {String} type - the name of the application to create
     * @param {Object} [options] - a configuration object
     * @param {Function} [callback] - callback function(err, instance)

     * @returns {*}
     */
    spreadshirt.create = function (type, options, callback) {
        options = options || {};
        callback = callback || function () {
        };

        var app = applications[type];
        if (!app) {
            return callback(new Error("Application from type '" + type + "' not found"));
        }

        // bootstrap the application
        new app(options, callback);
    };

    spreadshirt.buy = function(options, callback) {
        options = options || {};
        callback = callback || function() {};

        var platform = options.platform === "NA" ? "NA" : "EU";

        defaults(options, {
            url: "//checkout.spreadshirt." + (platform === "EU" ? "net" : "com") + "/buy"
        });

        var iFrame = document.createElement("iframe");
        iFrame.id = "buy";

        iFrame.onload = function() {
            // post
            var channel = new Channel(window, iFrame, "*");
            channel.call("checkout", options, callback);
        };

        iFrame.onerror = callback;

        iFrame.setAttribute("style", "border: 0 none; width: 0; height: 0; visibility: hidden;");
        iFrame.setAttribute("allowpaymentrequest", "");
        iFrame.src = options.url;
        document.getElementsByTagName("body")[0].appendChild(iFrame);

    };

    spreadshirt.buy.isSupported = function() {
        return !!window.PaymentRequest;
    };


    /***
     * extend the first object with all keys from the following objects
     *
     * @param [result]
     * @returns {Object}
     */
    function extend(result) {
        var args = Array.prototype.slice.call(arguments);

        if (args.length > 1) {
            for (var i = 1; i < args.length; i++) {
                var obj = args[i];

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key] = obj[key];
                    }
                }
            }
        }

        return result;
    }

    function defaults (target) {
        for (var i = 1; i < arguments.length; i++) {
            target = target || {};

            var d = arguments[i] || {};

            for (var key in d) {

                if (d.hasOwnProperty(key)) {
                    if (target[key] === undefined && d[key] !== undefined && d[key] !== null) {
                        target[key] = d[key];
                    }
                }
            }
        }

        return target;
    }

    function parseDeeplinks (deeplinks) {
        var urlParameter = location.search.replace(/^\?/, '').split('&');
        for (var i = 0; i < urlParameter.length; i++) {
            var parameter = urlParameter[i].split('=');

            if (deeplinks.hasOwnProperty(parameter[0]) && parameter[1]) {
                deeplinks[parameter[0]] = decodeURIComponent(parameter[1]);
            }
        }
    }

    function Channel(window, targetWindow, origin) {

        origin = origin || "*";

        var messageId = 0,
            callbackCache = {};

        if (window.addEventListener) {
            window.addEventListener("message", receiveMessage, false);
        } else {
            window.attachEvent("onmessage", receiveMessage);
        }

        function receiveMessage(event) {

            var data = stringifyMessage ? JSON.parse(event.data) : event.data,
                messageId = data.messageId,
                callback = callbackCache[messageId];

            if (!callback) {
                // we haven't requested this message
                return;
            }

            if (event.source !== targetWindow.contentWindow) {
                // message came from a different window
                return;
            }

            delete callbackCache[messageId];
            callback && callback(data.error, data.data);

        }

        return {
            call: function (method, data, callback) {

                var id = ++messageId;

                callbackCache[id] = callback;

                var message = {
                    messageId: id,
                    method: method,
                    data: data
                };

                if (stringifyMessage) {
                    message = JSON.stringify(message);
                }

                targetWindow.contentWindow.postMessage(message, origin);
            }
        }

    }

    function RappidApplication(url, options, name, cb) {

        var callbackCalled = false,
            callback = function (err, data) {
                if (callbackCalled) {
                    return;
                }

                callbackCalled = true;
                cb && cb(err, data);
            },
            proxy = {},
            platform,
            iFrame,
            initializationTimer,
            initialized = false,
            bootStrapCalled = false,
            channel,
            shopId;
        var hasQuestionMark = url.indexOf('?') > -1;


        options = extend({
            platform: "EU",
            target: document.body || document.getElementsByTagName("body")[0],
            width: "100%",
            height: "700px",
            parseDeeplinks: false
        }, options);


        platform = options.platform === "NA" ? "NA" : "EU";

        options.shopId = options.shopId || (platform === "EU" ? 205909 : 93439);

        // overwrites
        options = extend(options, {
            mode: (options.mode === "partner" ? "partner" : "external"),
            contextId: options.shopId,
            context: "shop"
        });

        if (options.parseDeeplinks) {
            var deeplinks = {};
            for (var i = 0; i < possibleDeeplinks.length; i++) {
                deeplinks[possibleDeeplinks[i]] = null;
            }

            parseDeeplinks(deeplinks);
            defaults(options, deeplinks);
        }

        shopId = options.shopId;
        delete options.shopId;

        // as we cannot pass functions via post message, we need to wrap those
        for (var key in options) {
            if (options.hasOwnProperty(key) && options[key] instanceof Function) {
                proxy[key + "Proxy"] = options[key];
                // let the client know that it should build a proxy for it
                options[key] = key + "Proxy";
            }
        }

        if (window.location.protocol === "file:" && /^\/{2}/.test(url)) {
            url = "http:" + url;
        }

        url = url.replace(/^file/i, "http");

        if (shopId) {
            if (hasQuestionMark) {
                url += '&shopId=' + shopId;
            } else {
                url += '?shopId=' + shopId;
                hasQuestionMark = true;
            }

        }

        if (options.version) {
            if (hasQuestionMark) {
                url += '&version=' + options.version;
            } else {
                url += '?version=' + options.version;
                hasQuestionMark = true;
            }
        }

        if (window.addEventListener) {
            window.addEventListener("message", receiveMessage, false);
        } else {
            window.attachEvent("onmessage", receiveMessage);
        }

        iFrame = document.createElement("iframe");
        iFrame.id = name;

        iFrame.onload = function () {

            if (!initialized) {
                initializationTimer = setTimeout(function () {
                    // initialization took to long
                    callback(new Error("Initialisation took too long"));
                }, 1000);
            } else {
                bootStrap();
            }
        };

        iFrame.setAttribute("width", options.width);
        iFrame.setAttribute("height", options.height);
        iFrame.setAttribute("style", "border: 0");
        iFrame.setAttribute("allowpaymentrequest", "");
        iFrame.setAttribute("allowfullscreen", "");

        iFrame.src = url;
        options.target.appendChild(iFrame);

        delete options.target;
        track(name, options);

        function bootStrap() {

            if (bootStrapCalled) {
                return;
            }

            bootStrapCalled = true;

            channel = channel || new Channel(window, iFrame);
            channel.call("bootStrap", options, function (err, data) {

                var control;
                if (!err && data) {
                    control = {};

                    for (var i = 0; i < data.length; i++) {
                        (function (method) {
                            // last parameter is callback
                            control[method] = function () {

                                var params = Array.prototype.slice.call(arguments),
                                    callback = params.pop();

                                if (Object.prototype.toString.call(callback) !== "[object Function]") {
                                    // seems not to be the callback
                                    params.push(callback);
                                    callback = null;
                                }

                                try {
                                    channel.call("invokeExternalMethod", {
                                        method: method,
                                        params: params
                                    }, function(err, data) {

                                        data = data || [];
                                        data.unshift(err);

                                        callback && callback.apply(this, data);
                                    });
                                } catch (e) {
                                    callback && callback(e);
                                }
                            }
                        })(data[i]);
                    }
                }

                callback(err, control);
            });
        }


        function receiveMessage(event) {
            if (event.source !== iFrame.contentWindow) {
                return;
            }

            var message = event.data;
            if (message === "initialized") {
                initialized = true;
                initializationTimer && clearTimeout(initializationTimer);

                bootStrap();
            } else {

                message = stringifyMessage ? JSON.parse(message) : message;

                var proxyMethod = message.method,
                    method = proxy[proxyMethod];

                if (method) {

                    var params = message.data;
                    params.push(function(err) {
                        var args = Array.prototype.slice.call(arguments) || [];
                        args.shift();

                        var value = {
                            messageId: message.messageId,
                            error: err,
                            data: args
                        };

                        if (stringifyMessage) {
                            value = JSON.stringify(value);
                        }

                        return event.source.postMessage(value, "*");
                    });

                    // TODO: distinguish between async and sync methods
                    // call method async
                    method.apply(this, params);

                } else {

                }

            }
        }
    }

    function Sketchomat(options, callback) {
        var url,
        platform = options.platform === "NA" ? "NA" : "EU";

        url = "//designer.spreadshirt." + (platform === "EU" ? "net" : "com") + "/designers/sketchomat?mode=external";

        if (options.url) {
            url = options.url;
        }

        options.shopId = "" + (options.shopId || "");

        RappidApplication.prototype.constructor.call(this, url, options, "sketchomat", callback);
    }

    function Smartomat(options, callback) {
        var url,
            platform = options.platform === "NA" ? "NA" : "EU";

        url = "//designer.spreadshirt." + (platform === "EU" ? "net" : "com") + "/designers/smartomat?mode=external";

        if (options.url) {
            url = options.url;
        }

        options.shopId = "" + (options.shopId || "");

        RappidApplication.prototype.constructor.call(this, url, options, "smartomat", callback);
    }

    var spreadshirtLoaded = window.spreadshirtLoaded;
    if (spreadshirtLoaded && spreadshirtLoaded instanceof Function) {
        spreadshirtLoaded = [spreadshirtLoaded];
    }

    if (spreadshirtLoaded instanceof Array) {
        for (var i = 0; i < spreadshirtLoaded.length; i++) {
            try {
                // invoke lazy load callbacks
                spreadshirtLoaded[i](spreadshirt);
            } catch (e) {
            }
        }
    }
})(window, document);
