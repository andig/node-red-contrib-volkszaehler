module.exports = function(RED) {
    var url = require('url');

    function ContextUriNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.middleware = RED.nodes.getNode(config.middleware) || {};

        this.on('input', function(msg) {
            if (this.middleware.uri) {
                var uri = this.middleware.uri;

                if (this.config.context == 'push') {
                    var parsed = url.parse(uri);
                    uri = parsed.protocol + '//' + parsed.hostname + ':5582';
                }
                else {
                    uri += this.config.context;

                    if (msg.uuid) {
                        uri += '/' + msg.uuid;
                    }

                    uri += '.' + this.config.format;
                }

                if (this.config.format == 'json') {
                    msg.headers = Object.assign(msg.headers || {}, {
                        "Content-type" : "application/json"
                    });
                }

                if (this.middleware.token) {
                    msg.headers = Object.assign(msg.headers || {}, {
                        "Authorization" : "Bearer " + this.middleware.token
                    });
                }

                // for compatibility with HTTP request node
                msg.url = uri;
            }

            this.send(msg);
        });
    }

    RED.nodes.registerType('uri', ContextUriNode);
};
