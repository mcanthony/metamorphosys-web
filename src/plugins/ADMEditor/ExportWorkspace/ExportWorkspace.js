/*globals define*/
/**
* Generated by PluginGenerator from webgme on Thu Jul 17 2014 10:06:34 GMT-0500 (Central Daylight Time).
*/

define(['plugin/PluginConfig',
    'plugin/PluginBase',
    'plugin/ExportWorkspace/ExportWorkspace/meta',
    'plugin/ExportWorkspace/ExportWorkspace/Templates/Templates',
    'plugin/AdmExporter/AdmExporter/AdmExporter',
    'xmljsonconverter',
    'ejs'], function (PluginConfig, PluginBase, MetaTypes, TEMPLATES, AdmExporter, Converter, ejs) {
    'use strict';

    /**
    * Initializes a new instance of ExportWorkspace.
    * @class
    * @augments {PluginBase}
    * @classdesc This class represents the plugin ExportWorkspace.
    * @constructor
    */
    var ExportWorkspace = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.meta = null;
        this.admExporter = null;
        this.artifact = null;
        this.addedAdms = {};
    };

    // Prototypal inheritance from PluginBase.
    ExportWorkspace.prototype = Object.create(PluginBase.prototype);
    ExportWorkspace.prototype.constructor = ExportWorkspace;

    /**
    * Gets the name of the ExportWorkspace.
    * @returns {string} The name of the plugin.
    * @public
    */
    ExportWorkspace.prototype.getName = function () {
        return "Export Workspace";
    };

    /**
    * Gets the semantic version (semver.org) of the ExportWorkspace.
    * @returns {string} The version of the plugin.
    * @public
    */
    ExportWorkspace.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
    * Gets the description of the ExportWorkspace.
    * @returns {string} The description of the plugin.
    * @public
    */
    ExportWorkspace.prototype.getDescription = function () {
        return "Exports everything in the work-space for desktop gme.";
    };

    /**
    * Gets the configuration structure for the ExportWorkspace.
    * The ConfigurationStructure defines the configuration for the plugin
    * and will be used to populate the GUI when invoking the plugin from webGME.
    * @returns {object} The version of the plugin.
    * @public
    */
    ExportWorkspace.prototype.getConfigStructure = function () {
        return [
        ];
    };


    /**
    * Main function for the plugin to execute. This will perform the execution.
    * Notes:
    * - Always log with the provided logger.[error,warning,info,debug].
    * - Do NOT put any user interaction logic UI, etc. inside this method.
    * - callback always has to be called even if error happened.
    *
    * @param {function(string, plugin.PluginResult)} callback - the result callback
    */
    ExportWorkspace.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;
        if (!self.activeNode) {
            self.createMessage(null, 'Active node is not present! This happens sometimes... Loading another model ' +
                'and trying again will solve it most of times.', 'error');
            callback('Active node is not present!', self.result);
            return;
        }
        if (self.isMetaTypeOf(self.activeNode, self.META.WorkSpace) === false) {
            self.createMessage(null, 'This plugin must be called from a WorkSpace.', 'error');
            callback(null, self.result);
            return;
        }

        self.meta = MetaTypes;
        self.updateMETA(self.meta);
        self.artifact = self.blobClient.createArtifact('workspace');
        self.visitAllChildrenFromWorkspace(self.activeNode, function (err) {
            if (err) {
                self.result.setSuccess(false);
                self.logger.error(err);
                callback(null, self.result);
                return;
            }
            self.artifact.addFile('workspace.xme', ejs.render(TEMPLATES['workspace.xme.ejs']), function (err, hash) {
                if (err) {
                    self.result.setSuccess(false);
                    self.createMessage(null, 'Could not add workspace.xme to artifact.', 'error');
                    callback(null, self.result);
                    return;
                }
                self.artifact.save(function (err, hash) {
                    if (err) {
                        self.result.setSuccess(false);
                        callback(err, self.result);
                        return;
                    }
                    self.result.addArtifact(hash);
                    self.result.setSuccess(true);
                    callback(null, self.result);
                });
            });
        });
    };

    ExportWorkspace.prototype.addAcm = function (node, callback) {
        var self = this,
            acmHash = self.core.getAttribute(node, 'Resource'),
            componentID = self.core.getAttribute(node, 'ID'),
            name = self.core.getAttribute(node, 'name'),
            filename = 'acms/' + name + '__' + componentID.replace(/[^\w]/gi, '_') + '.zip';
        if (acmHash) {
            self.artifact.addObjectHash(filename, acmHash, function (err, hash) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null);
            });
        } else {
            self.logger.warning('Acm did not have a resource');
        }
    };

    ExportWorkspace.prototype.addAdm = function (node, callback) {
        var self = this;
        self.initializeAdmExporter();
        self.admExporter.exploreDesign(node, false, function (err) {
            var jsonToXml = new Converter.Json2xml(),
                designName,
                filename,
                admString;
            if (err) {
                callback('AdmExporter.exploreDesign failed with error: ' + err);
                return;
            }
            designName = self.admExporter.admData['@Name'];
            filename = 'adms/' + designName + '.adm';
            admString = jsonToXml.convertToString({Design: self.admExporter.admData});
            if (self.addedAdms[filename]) {
                self.logger.warning(designName + ' occurs more than once, appending its guid to filename.');
                filename = 'adms/' + designName + '__' + self.core.getGuid(node).replace(/[^\w]/gi, '_') + '.adm';
            }
            self.addedAdms[filename] = true;
            self.artifact.addFile(filename, admString, function (err, hash) {
                callback(err);
            });
        });
    };

    ExportWorkspace.prototype.addAtm = function (node, callback) {
        var self = this;
        self.logger.warning('TODO: Export ATMs...');
        callback(null);
    };

    ExportWorkspace.prototype.atModelNode = function (node, parent, callback) {
        var self = this,
            nodeType = self.core.getAttribute(self.getMetaType(node), 'name'),
            nodeName = self.core.getAttribute(node, 'name'),
            parentName = self.core.getAttribute(parent, 'name');

        self.logger.info('At node "' + nodeName + '" of type "' + nodeType + '" with parent "' + parentName + '".');

        if (nodeType === 'AVMComponentModel') {
            self.addAcm(node, callback);
        } else if (nodeType === 'Container') {
            self.addAdm(node, callback);
        } else if (nodeType === 'AVMTestBenchModel') {
            self.addAtm(node, callback);
        } else if (nodeType === 'ACMFolder' || nodeType === 'ADMFolder' || nodeType === 'ATMFolder') {
            callback(null, true);
        } else {
            callback(null);
        }
    };

    ExportWorkspace.prototype.visitAllChildrenFromWorkspace = function (wsNode, callback) {
        var self = this,
            error = '',
            counter,
            counterCallback;

        counter = {visits: 1};
        counterCallback = function (err) {
            error = err ? error + err : error;
            counter.visits -= 1;
            if (counter.visits === 0) {
                callback(error);
            }
        };

        self.visitAllChildrenRec(wsNode, counter, counterCallback);
    };

    ExportWorkspace.prototype.visitAllChildrenRec = function (node, counter, callback) {
        var self = this;
        self.core.loadChildren(node, function (err, children) {
            var i,
                atModelNodeCallback;
            if (err) {
                callback('loadChildren failed for ' + self.core.getAttribute(node, 'name'));
                return;
            }
            counter.visits += children.length;
            if (children.length === 0) {
                callback(null);
            } else {
                counter.visits -= 1;
                atModelNodeCallback = function (childNode) {
                    return function (err, isFolder) {
                        if (err) {
                            callback(err);
                        }

                        if (isFolder) {
                            self.visitAllChildrenRec(childNode, counter, callback);
                        } else {
                            callback(null);
                        }
                    };
                };
                for (i = 0; i < children.length; i += 1) {
                    self.atModelNode(children[i], node, atModelNodeCallback(children[i]));
                }
            }
        });
    };

    ExportWorkspace.prototype.initializeAdmExporter = function () {
        var self = this;
        if (self.admExporter === null) {
            self.admExporter = new AdmExporter();
            self.admExporter.meta = self.meta;
            self.admExporter.META = self.META;
            self.admExporter.core = self.core;
            self.admExporter.logger = self.logger;
            self.admExporter.result = self.result;
            self.logger.info('AdmExporter had not been initialized - created a new instance.');
        } else {
            self.admExporter.rootPath = null;
            self.admExporter.includeAcms = false;
            self.logger.info('AdmExporter had already been initialized - reset rootPath.');
        }
    };

    return ExportWorkspace;
});