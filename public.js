module.exports = function(RED) {
    var request = require('request');

    function PublicEntitiesNode(config) {
        RED.nodes.createNode(this, config);

        this.middleware = RED.nodes.getNode(config.middleware) || {};

        this.on('input', function(msg) {
            if (this.middleware.uri) {
                var uri = this.middleware.uri + 'entity.json';
                
                request(uri, function(error, response, body) {
                    if (error || response.statusCode !== 200) {
                        this.send({
                            payload: error,
                            statusCode: response.statusCode,
                            response: response
                        });
                        return;
                    }

                    this.map = {};

                    var json = JSON.parse(body);
                    this.parseEntities(json.entities);

                    // store in middleware
                    this.middleware.publicEntities = this.map;

                    this.send({
                        payload: this.map
                    });
                }.bind(this));
            }
        });

        this.on('close', function() {
            // tidy up any state
        });

        this.parseEntities = function(entities, parent) {
            var path = parent ? parent + '.' : '';

            entities.forEach(function(entity) {
                var selector = path + entity.title;
                selector = selector.replace(/[\- ]/g, '');

                this.updateMap(entity.title, entity);
                if (selector != entity.title) {
                    this.updateMap(selector, entity);
                }

                if (entity.children) {
                    this.parseEntities(entity.children, selector);
                }
            }.bind(this));
        };

        this.updateMap = function(identifier, entity) {
            console.log(entity.uuid +" "+ identifier);
            if (this.map[identifier] !== undefined) {
                if (this.map[identifier].uuid !== entity.uuid) {
                    // duplicate entity name?
                    this.warn("Identifier `"+identifier+"` already defined, skipping.");
                }
            }
            else {
                this.map[identifier] = entity;
            }
        };
    }

    RED.nodes.registerType('public', PublicEntitiesNode);
};
