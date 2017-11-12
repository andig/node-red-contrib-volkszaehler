module.exports = function(RED) {
    var crypto = require('crypto');

    function UuidNode(config) {
        RED.nodes.createNode(this, config);

        this.middleware = RED.nodes.getNode(config.middleware).uri;
        this.hash = 'vz_' + crypto.createHash('md5').update(this.middleware).digest("hex");

        this.on('input', function(msg) {
            if (msg.topic && this.middleware) {
                var context = this.context().global;
                var map = context.get(this.hash) || {};

                var entity = map[msg.topic];
                if (entity !== undefined) {
                    msg.uuid = entity.uuid;
                }
                else {
                    this.warn('No uuid for `'+msg.topic+'`');
                }
            }

            this.send(msg);
        });
    }

    RED.nodes.registerType('uuid', UuidNode);
};
