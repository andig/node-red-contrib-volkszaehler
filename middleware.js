module.exports = function(RED) {
    function MiddlewareNode(config) {
        RED.nodes.createNode(this, config);

        this.uri = config.middleware;

        // ensure trailing slash
        if (this.uri && this.uri.slice(-1) !== '/') {
            this.uri += '/';
        }
    }

    RED.nodes.registerType("middleware", MiddlewareNode, {
        credentials: {
            username: { type: "text" } ,
            password: { type: "password" }
        }
    });
};
