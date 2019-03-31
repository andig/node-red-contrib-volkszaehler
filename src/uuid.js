module.exports = function(RED) {

    function UuidNode(config) {
        RED.nodes.createNode(this, config);

        this.middleware = RED.nodes.getNode(config.middleware) || {};

        this.on('input', function(msg) {
            if (msg.topic && this.middleware.uri) {
                // get from middleware
                var map = this.middleware.publicEntities || {};

                var entity = map[msg.topic];
                if (entity !== undefined) {
                    msg.uuid = entity.uuid;
                    this.send([msg, null]);
                    return;
                }
            }

            this.send([null, msg]);
        });
    }

    RED.nodes.registerType('uuid', UuidNode);
};
