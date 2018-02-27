module.exports = function(RED) {
    var request = require('request');
    var jwt = require('jsonwebtoken');

    function MiddlewareNode(config) {

        /**
         * Perform middleware login and return token
         */
        function middlewareLogin(uri, credentials, func) {
            uri = uri + 'auth.json';

            request({
                uri: uri,
                method: 'POST',
                body: JSON.stringify(credentials)
            }, function(error, response, body) {
                if (error || response.statusCode !== 200) {
                    func(false);
                    return;
                }

                var json = JSON.parse(body);
                func(json.authtoken);
            });
        }

        /**
         * Get timeout for token refresh
         */
        function getTokenRefreshTimeout(token) {
            if (token) {
                var decoded = jwt.decode(token);

                // expiry date in future?
                if (decoded.exp && 1000 * decoded.exp > Date.now()) {
                    // refresh once a day or halfway to expiry
                    var timeout = Math.min(24 * 3.6e6, Math.ceil((1000 * decoded.exp - Date.now()) / 2));
                    return timeout;
                }
            }

            // retry in 1s
            return 1000;
        }

        /**
         * Refresh middleware token
         */
        this.refreshToken = function () {
            middlewareLogin(node.uri, node.credentials, function(token) {
                if (token) {
                    node.token = token;
                }

                var timeout = getTokenRefreshTimeout(node.token);
                node.refreshTimeout = setTimeout(node.refreshToken, timeout);
            }.bind(node));
        };

        /**
         * Get middleware property by key
         */
        this.get = function (key) {
            return this._values[key];
        };

        /**
         * Set middleware property by key
         */
        this.set = function (key, value) {
            this._values[key] = value;
        };

        /*
         * Main
         */
        RED.nodes.createNode(this, config);
        var node = this;

        // ensure trailing slash
        this.uri = config.middleware;

        if (this.uri && this.uri.slice(-1) !== '/') {
            this.uri += '/';
        }

        // context interface
        this._values = {};

        // need to get token
        if (this.uri && this.credentials &&
            this.credentials.username && this.credentials.password)
        {
            this.refreshToken();
        }

        this.on("close", function () {
            if (node.refreshTimeout) {
                clearTimeout(node.refreshTimeout);
            }
        });
    }

    RED.nodes.registerType("middleware", MiddlewareNode, {
        credentials: {
            username: { type: "text" } ,
            password: { type: "password" }
        }
    });
};
