/*globals angular */

/**
 * @author ksmyth / https://github.com/ksmyth
 */

angular.module('cyphy.services')
    .service('acmImportService', function ($q, $log, pluginService, nodeService) {
        'use strict';

        this.importAcm = function (context, parentId, acmUrl, position) {
            var config = {
                activeNode: parentId,
                runOnServer: true,
                pluginConfig: {
                    AcmUrl: acmUrl,
                    DeleteExisting: true,
                    position: position
                }
            };
            //console.log(JSON.stringify(config));
            return pluginService.runPlugin(context, 'AcmImporter', config)
                .then(function (result) {
                    if (result.error) {
                        return $q.reject(result.error);
                    }
                    return result.messages.filter(function (m) {
                        return m.message === 'Added ACM';
                    }).map(function (m) {
                        return m.activeNode.id;
                    })[0];
                })
                .catch(function (reason) {
                    $log('Something went terribly wrong, ' + reason);
                });
        };

        this.swapAcm = function (context, originalId, acmUrl) {
            var self = this,
                getNodeById = function(nodes, id) {
                    return nodes.filter(function (node) {
                        return node.getId() === id;
                    })[0];
                };
            return nodeService.loadNode(context, originalId)
                .then(function (original) {
                    var position = original.getRegistry('position');
                    // TODO start tx

                    $q.all([self.importAcm(context, original.getParentId(), acmUrl, position),
                        original.loadChildren()])
                        .then(function (args) {
                            var replacement = args[0],
                                originalChildren = args[1],
                                originalChildrenConnections = [],
                                getConnections = function (node, name) {
                                    return $q.all(node.getCollectionPaths(name)
                                        .filter(function (id) {
                                            return id.indexOf(node.getId()) !== 0;
                                        })
                                        .map(function (id) {
                                            return nodeService.loadNode(context, id);
                                        }));
                                },
                                connectionsMaps = {
                                    'dst': {},
                                    'src': {}
                                },
                                connectionMapFn = function (name) {
                                    return function (childNode) {
                                        return getConnections(childNode, name)
                                            .then(function (connections) {
                                                connectionsMaps[name][childNode.getId()] = connections;
                                                return connections;
                                            });
                                    };
                                },
                                dstConnections = originalChildren.map(connectionMapFn('dst')),
                                srcConnections = originalChildren.map(connectionMapFn('src'));

                            $q.all([connectionsMaps,
                                nodeService.loadNode(context, replacement).then(function (replacement) { return replacement.loadChildren(); }),
                                dstConnections,
                                srcConnections])
                                .then(function switchConnections(args) {
                                    var connectionsMaps = args[0],
                                        replacementChildren = args[1];
                                    for (var name in connectionsMaps) {
                                        for (var origChildId in connectionsMaps[name]) {
                                            connectionsMaps[name][origChildId].forEach(function (conn) {
                                                var origChildName = getNodeById(originalChildren, origChildId).getAttribute('name'),
                                                    replacement = replacementChildren.filter(function (child) {
                                                    return child.getAttribute('name') === origChildName;
                                                })[0];
                                                if (replacement) {
                                                    conn.makePointer(name, replacement.getId());
                                                } else {
                                                    $log('Could not match port ' + origChildName);
                                                }
                                            });
                                        }
                                    }
                                }).then(function () {
                                    original.destroy();
                                });
                        });
                });

        };

        this.storeDroppedAcm = function (file) {
            var deferred = $q.defer();

            var blobClient = new GME.classes.BlobClient(
                {
                    httpsecure: window.location.protocol === 'https:',
                    server: window.location.hostname,
                    serverPort: window.location.port
                }
            );
            blobClient.putFile(file.name, file, function (err, hash) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(blobClient.getDownloadURL(hash));
            });

            return deferred.promise;
        };

    });