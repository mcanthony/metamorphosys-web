/**
* Generated by PluginGenerator from webgme on Wed Jun 04 2014 17:28:00 GMT-0500 (Central Daylight Time).
*/

define(['plugin/PluginConfig', 'plugin/PluginBase', 'plugin/GeneratePluginTests/GeneratePluginTests/meta', 'ejs', 'plugin/GeneratePluginTests/GeneratePluginTests/Templates/Templates'], function (PluginConfig, PluginBase, MetaTypes, ejs, TEMPLATES) {
    'use strict';

    /**
    * Initializes a new instance of GeneratePluginTests.
    * @class
    * @augments {PluginBase}
    * @classdesc This class represents the plugin GeneratePluginTests.
    * @constructor
    */
    var GeneratePluginTests = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.metaTypes = MetaTypes;
        this.tests = [];
        this.validPluginNames = {
            AcmImporter: true,
            AdmExporter: true,
            AdmImporter: true,
            GeneratePluginTests: true,
            TestBenchRunner: true
        };
    };

    // Prototypal inheritance from PluginBase.
    GeneratePluginTests.prototype = Object.create(PluginBase.prototype);
    GeneratePluginTests.prototype.constructor = GeneratePluginTests;

    /**
    * Gets the name of the GeneratePluginTests.
    * @returns {string} The name of the plugin.
    * @public
    */
    GeneratePluginTests.prototype.getName = function () {
        return "Generate Plugin Tests";
    };

    /**
    * Gets the semantic version (semver.org) of the GeneratePluginTests.
    * @returns {string} The version of the plugin.
    * @public
    */
    GeneratePluginTests.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
    * Gets the description of the GeneratePluginTests.
    * @returns {string} The description of the plugin.
    * @public
    */
    GeneratePluginTests.prototype.getDescription = function () {
        return "Finds all generated tests from root and generates simple fail/success tests for the registered plugins.";
    };

    /**
    * Gets the configuration structure for the GeneratePluginTests.
    * The ConfigurationStructure defines the configuration for the plugin
    * and will be used to populate the GUI when invoking the plugin from webGME.
    * @returns {object} The version of the plugin.
    * @public
    */
    GeneratePluginTests.prototype.getConfigStructure = function () {
        return [
            {
                'name': 'name',
                'displayName': 'Test Group Name',
                'regex': '^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[a-zA-Z_$][0-9a-zA-Z_$]*',
                'regexMessage': 'No spaces and special characters allowed. This value is used as the name of the generated plugin class.',
                'description': 'Name of Generated file and test.',
                'value': 'Testing',
                'valueType': 'string',
                'readOnly': false
            }
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
    GeneratePluginTests.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            config = self.getCurrentConfig();
        self.updateMETA(self.metaTypes);
        // TODO: This should export the Project too, I think.
        // And we should have a utility script that loads test-projects.
        self.visitAllChildren(self.rootNode, function (err) {
            var i,
                artie,
                filesToAdd,
                testFilePath;
            if (err) {
                self.createMessage(self.rootNode, 'Visiting nodes failed, err: ' + err.toString());
                callback(err, self.result);
                return;
            }

            for (i = 0; i < self.tests.length; i += 1) {
                self.logger.info(JSON.stringify(self.tests[i], null, 4));
            }
            testFilePath = 'test/functional/plugins/' + config.name + '.js';
            filesToAdd = {
                'debug.json': JSON.stringify({tests: self.tests}, null, 4)
            };
            filesToAdd[testFilePath] = ejs.render(TEMPLATES['TestTemplate.js.ejs'], {name: config.name, tests: self.tests});
            artie = self.blobClient.createArtifact('tests');
            artie.addFiles(filesToAdd, function (err, hashes) {
                if (err) {
                    self.createMessage(self.rootNode, 'Could not add files to artifact, err: ' + err.toString());
                    callback(err, self.result);
                    return;
                }
                self.logger.info('Added files : ' + hashes.toString());
                artie.save(function (err, hash) {
                    if (err) {
                        self.createMessage(self.rootNode, 'Could not save artifact, err: ' + err.toString());
                        callback(err, self.result);
                        return;
                    }
                    self.createMessage(null, 'Added ' + self.tests.length.toString() + ' tests.');
                    self.result.addArtifact(hash);
                    self.result.setSuccess(true);
                    callback(err, self.result);
                });
            });
        });
    };

    GeneratePluginTests.prototype.atTestNode = function (node, callback) {
        var self = this,
            testName = self.core.getAttribute(node, 'name'),
            msg;
        if (self.core.hasPointer(node, 'TestPoint')) {
            self.core.loadPointer(node, 'TestPoint', function (err, testPoint) {
                var pluginNames, i;
                if (err) {
                    msg = 'Could not load "TestPoint" pointer for "' + testName + '", err:' + err.toString() + '. ';
                    msg += 'Proceeding but test will be skipped!';
                    self.logger.error(msg);
                    self.createMessage(node, msg);
                    callback(null);
                    return;
                }
                pluginNames = self.core.getAttribute(node, 'plugins').split(' ');
                for (i = 0; i < pluginNames.length; i += 1) {
                    if (self.validPluginNames[pluginNames[i]]) {
                        self.tests.push({
                            name: testName,
                            plugin: pluginNames[i],
                            success: self.core.getAttribute(node, 'success'),
                            testPoint: self.core.getPath(testPoint),
                            asset: self.core.getAttribute(node, 'expectedResult')
                        });
                    } else {
                        msg = '"' + testName + '" has an invalid plugin registered "' + pluginNames[i] + '" the test ' +
                            'for that plugin will not be generated.';
                        self.logger.warning(msg);
                        self.createMessage(node, msg);
                    }
                }
                callback(null);
            });
        } else {
            msg = '"' + testName + '" did is a test but did not have a TestPoint - it will not be included.';
            self.logger.warning(msg);
            self.createMessage(node, msg);
            callback(null);
        }
    };

    GeneratePluginTests.prototype.visitAllChildren = function (rootNode, callback) {
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

        self.visitAllChildrenRec(rootNode, counter, counterCallback);
    };

    GeneratePluginTests.prototype.visitAllChildrenRec = function (node, counter, callback) {
        var self = this;
        self.core.loadChildren(node, function (err, children) {
            var i,
                childMetaTypeName;
            if (err) {
                callback('loadChildren failed for ' + self.core.getAttribute(node, 'name'));
                return;
            }
            counter.visits += children.length;
            if (children.length === 0) {
                callback(null);
            } else {
                counter.visits -= 1;
                for (i = 0; i < children.length; i += 1) {
                    childMetaTypeName = self.core.getAttribute(self.getMetaType(children[i]), 'name');
                    if (childMetaTypeName === 'Test') {
                        if (self.core.getAttribute(children[i], 'isTest')) {
                            self.atTestNode(children[i], callback);
                        } else {
                            self.logger.info('At test-folder :' + self.core.getAttribute(children[i], 'name'));
                            self.visitAllChildrenRec(children[i], counter, callback);
                        }
                    } else {
                        self.logger.info('Not test-node skipping : ' + childMetaTypeName);
                        callback(null);
                    }
                }
            }
        });
    };

    return GeneratePluginTests;
});