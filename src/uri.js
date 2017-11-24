module.exports = function(RED) {

    function ContextUriNode(config) {
        RED.nodes.createNode(this, config);

        this.config = config;
        this.middleware = RED.nodes.getNode(config.middleware) || {};

        this.on('input', function(msg) {
            if (this.middleware.uri) {
                var uri = this.middleware.uri;
                uri += this.config.context;

                if (msg.uuid) {
                    uri += '/' + msg.uuid;
                }

                uri += '.' + this.config.format;

                // if (this.config.format == 'json') {
                //     msg.headers = {
                //         "Content-type" : "application/json"
                //     };                    
                // }

                msg.uri = uri;
            }

            this.send(msg);
        });
    }

    RED.nodes.registerType('uri', ContextUriNode);
};
