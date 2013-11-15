(function (window, document) {

    var spreadshirt = window.spreadshirt = window.spreadshirt || {},
        applications = {
            tablomat: Tablomat,
            productomat: Productomat
        },
        supportedLanguages = {
            NA: ["en", "fr"],
            EU: ["de", "dk", "pl", "fi", "en", "fr", "es", "nl", "it", "no", "se"]
        };

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

            var data = event.data,
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

                targetWindow.contentWindow.postMessage({
                    messageId: id,
                    method: method,
                    data: data
                }, origin);
            }
        }

    }

    function Application(options) {
    }

    function rAppidApplication(url, options, cb) {

        var callbackCalled = false,
            callback = function (err, data) {
                if (callbackCalled) {
                    return;
                }

                callbackCalled = true;
                cb && cb(err, data);
            },
            platform,
            iFrame,
            initializationTimer,
            initialized = false,
            bootStrapCalled = false,
            channel;


        options = extend({
            platform: "EU",
            target: document.body || document.getElementsByTagName("body")[0],
            width: "100%",
            height: "700px"
        }, options);

        platform = options.platform === "NA" ? "NA" : "EU";

        options.shopId = options.shopId || (platform === "EU" ? 205909 : 93439);

        // overwrites
        options = extend(options, {
            mode: "external",
            contextId: options.shopId,
            context: "shop"
        });

        delete options.shopId;


        if (window.location.protocol === "file:") {
            url = "http:" + url;
        }

        if (window.addEventListener) {
            window.addEventListener("message", receiveMessage, false);
        } else {
            window.attachEvent("onmessage", receiveMessage);
        }

        iFrame = document.createElement("iframe");

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

        iFrame.src = url;
        options.target.appendChild(iFrame);

        delete options.target;

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

            if (event.data === "initialized") {
                initialized = true;
                initializationTimer && clearTimeout(initializationTimer);

                bootStrap();
            }
        }
    }

    function Tablomat(options, callback) {
        var url,
            platform = options.platform === "NA" ? "NA" : "EU",
            country = platform === "EU" ? "DE" : "US",
            language = window.navigator.language || "en";

        if (supportedLanguages[platform].indexOf(language) === -1) {
            // fallback
            language = "en";
        }

        url = "//spreadshirt." + (platform === "EU" ? "net" : "com") + "/" + language + "/" + country + "/Tablomat/Index/external";

        rAppidApplication.prototype.constructor.call(this, url, options, callback);
    }

    function Productomat(options, callback) {
        rAppidApplication.prototype.constructor.call(this, '//sales.dev/www', options, callback);
    }

    Tablomat.prototype = new Application();
    Tablomat.prototype.constructor = Tablomat;

})(window, document);
