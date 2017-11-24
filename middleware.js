module.exports = function(RED) {
    function MiddlewareNode(config) {
        RED.nodes.createNode(this, config);

        // ensure trailing slash
        this.uri = config.middleware;

        if (this.uri && this.uri.slice(-1) !== '/') {
            this.uri += '/';
        }

        // context interface
        this._values = {};

        this.get = function (key) {
            return this._values[key];
        };

        this.set = function (key, value) {
            this._values[key] = value;
        };
    }

    RED.nodes.registerType("middleware", MiddlewareNode, {
        credentials: {
            username: { type: "text" } ,
            password: { type: "password" }
        }
    });
};
