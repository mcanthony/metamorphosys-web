/* global define */
/**
 * Generated by PluginGenerator from webgme on Thu May 08 2014 17:59:46 GMT-0500 (CDT).
 */

define(['plugin/PluginConfig',
    'plugin/PluginBase',
    'plugin/AcmImporter/AcmImporter/meta',
    'jszip',
    'xmljsonconverter'], function (PluginConfig, PluginBase, MetaTypes, JSZip, Xml2Json) {
    'use strict';

    /**
     * Initializes a new instance of AcmImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin AcmImporter.
     * @constructor
     */
    var AcmImporter = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.metaTypes = MetaTypes;
        this.id2NodeMap = {};
        this.valueFlowIdMap = {};
        this.recursionCounter = 0;
        this.id2ComponentMap = {};
        this.deleteExisting = false;
        this.cleanImport = true;
        this.projectNode = null;

        //this.propertyJson = {};
    };

    // Prototypal inheritance from PluginBase.
    AcmImporter.prototype = Object.create(PluginBase.prototype);
    AcmImporter.prototype.constructor = AcmImporter;

    /**
     * Gets the name of the AcmImporter.
     * @returns {string} The name of the plugin.
     * @public
     */
    AcmImporter.prototype.getName = function () {
        return "ACM Importer";
    };

    /**
     * Gets the semantic version (semver.org) of the AcmImporter.
     * @returns {string} The version of the plugin.
     * @public
     */
    AcmImporter.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
     * Gets the description of the AcmImporter.
     * @returns {string} The description of the plugin.
     * @public
     */
    AcmImporter.prototype.getDescription = function () {
        return "Imports one or more *.acm files and creates the WebGME objects";
    };

    /**
     * Gets the configuration structure for the AcmImporter.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    AcmImporter.prototype.getConfigStructure = function () {
        return [
            {
                "name": "UploadedFile",  // May be a single .acm or a zip containing several
                "displayName": "ACMs",
                "description": "Click and drag one or more *.acm files",
                //"value": "1eaa1570554d13e407265713cb8e93388f6908c8",
                //"value": "001ccfcecbe33a9512cc6fbbdc5947d363deb273",
                "value": "",  // FinalDrive w/2 classifications
                "valueType": "asset",
                "readOnly": false
            },
            {
                "name": "VulcanLink",  // May be a single .acm or a zip containing several
                "displayName": "ACM Link",
                "description": "Drag component link here",
                "value": "",
                "valueType": "vulcanLink",
                "readOnly": false
            },
            {
                "name": "DeleteExisting",
                "displayName": "DeleteExisting",
                "description": "Deletes any existing AVMComponent with matching ID",
                "value": false,
                "valueType": "boolean",
                "readOnly": false
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
     * @param {function(string, plugin.PluginResult)} mainCallback - the result callback
     */
    AcmImporter.prototype.main = function (mainCallback) {
        var self = this,
            acmFolderNode,
            currentConfig = self.getCurrentConfig(),
            uploadedFileHash = currentConfig.UploadedFile || currentConfig.VulcanLink,
        //uploadedFileHash = 'e0ebaea243ad1f5dc8278638c36d8a6fc03f0ab7',
            newAcm,
            numUploaded,
            numExisting = 0,  // count any existing (acm) objects in this folder
            numCreated = 0,
            xPosition,
            yPosition,
            xOffset = 100,
            yOffset = 100,
            xSpacing = 200,
            ySpacing = 200,
            componentsPerRow = 6;

        if (!self.activeNode) {
            self.createMessage(null, 'Active node not found! Try selecting another model and re-opening the desired model', 'error');
            mainCallback('Active node not found!', self.result);
            return;
        }

        self.updateMETA(self.metaTypes);

        if (!self.isMetaTypeOf(self.activeNode, MetaTypes.ACMFolder)) {
            var msg = "AcmImporter must be called from an ACMFolder!";
            self.logger.error(msg);
            self.createMessage(self.activeNode, msg, 'error');
            self.result.setSuccess(false);
            mainCallback(null, self.result);
            return;
        }

        acmFolderNode = self.activeNode;

        self.projectNode = self.getWorkspaceNode(acmFolderNode);
        self.deleteExisting = currentConfig.DeleteExisting;

        var findComponentsCallback = function () {
            var loadChildrenCallback = function (err, children) {
                if (err) {
                    self.createMessage(acmFolderNode, 'Could not load children of ' + self.core.getName(acmFolderNode), 'error');
                    self.logger.error('Could not load children of ' + self.core.getName(acmFolderNode) + ', err: ' + err);
                    self.result.setSuccess(false);
                    mainCallback(err, self.result);
                    return;
                }

                numExisting = children.length;

                var getAcmDescriptionCallback = function (err, hash2acmJsonMap) {
                    if (err) {
                        mainCallback(err, self.result);
                        return;
                    }

                    numUploaded = Object.keys(hash2acmJsonMap).length;

                    var acmJson;

                    for (var hash in hash2acmJsonMap) {
                        acmJson = hash2acmJsonMap[hash];
                        newAcm = self.createNewAcm(acmFolderNode, hash, acmJson);

                        xPosition = xOffset + xSpacing * (numExisting % componentsPerRow);
                        yPosition = yOffset + ySpacing * (Math.floor(numExisting / componentsPerRow));
                        self.core.setRegistry(newAcm, 'position', {x: xPosition, y: yPosition});

                        numExisting += 1;
                        numCreated += 1;
                    }

                    //var propertyString = JSON.stringify(self.propertyJson, null, 4);

                    self.save('added obj', function (err) {
                        if (err) {
                            mainCallback(err, self.result);
                            return;
                        }
                        if (numUploaded > 1) {
                            self.createMessage(acmFolderNode, numCreated + ' ACMs created out of ' + numUploaded + ' uploaded.', 'info');
                        }
                        if (self.cleanImport === true) {
                            self.result.setSuccess(true);
                        } else {
                            self.result.setSuccess(false);
                        }

                        mainCallback(null, self.result);
                    });
                };

                self.getAcmDetails(uploadedFileHash, getAcmDescriptionCallback);
            };

            self.core.loadChildren(acmFolderNode, loadChildrenCallback);
        };
        self.findComponentsRecursive(self.projectNode, findComponentsCallback);
    };

    AcmImporter.prototype.getWorkspaceNode = function (node) {
        var self = this;
        while (node) {
            if (self.isMetaTypeOf(node, self.metaTypes.WorkSpace)) {
                self.logger.info('Found work-space node : ' + self.core.getAttribute(node, 'name'));
                return node;
            }
            node = self.core.getParent(node);
        }
        self.logger.error('Could not find work-space node!!');
    };

    AcmImporter.prototype.findComponentsRecursive = function (node, callback) {
        // TODO: Error handling
        var self = this,
            metaTypeName = self.core.getAttribute(self.getMetaType(node), 'name'),
            loadChildrenCallback = function (err, children) {
                self.recursionCounter += children.length;

                for (var i = 0; i < children.length; i += 1) {
                    self.findComponentsRecursive(children[i], callback);
                }

                self.recursionCounter -= 1;

                if (self.recursionCounter === 0) {
                    callback();
                }
            };

        if (metaTypeName === 'WorkSpace') {
            self.recursionCounter += 1;
            self.core.loadChildren(node, loadChildrenCallback);
        } else if (metaTypeName === 'ACMFolder') {
            self.core.loadChildren(node, loadChildrenCallback);
        } else {
            if (metaTypeName === 'AVMComponentModel') {
                // Check if id2ComponentMap already has the ID - if so create a message about that node and overwrite it
                // in the map.
                self.id2ComponentMap[self.core.getAttribute(node, 'ID')] = node;
            }

            self.recursionCounter -= 1;

            if (self.recursionCounter === 0) {
                callback();
            }
        }
    };

    AcmImporter.prototype.createNewAcm = function (acmFolderNode, hash, acmJson) {
        var self = this,
            existingAcmNodeWithSameId,
            existingAcmParentFolder,
            newAcmNode,
            avmComponent = acmJson['Component'] || acmJson['avm:Component'],
            name = avmComponent['@Name'],
            id = avmComponent['@ID'],
            schemaVersion = avmComponent['@SchemaVersion'],
            version = avmComponent['@Version'],
            avmProperties,
            avmConnectors,
            avmDomainModels,
            avmPorts,
            formulas,
            i,
            msg;

        if (self.id2ComponentMap.hasOwnProperty(id)) {
            existingAcmNodeWithSameId = self.id2ComponentMap[id];
            existingAcmParentFolder = self.core.getParent(existingAcmNodeWithSameId);

            if (self.deleteExisting) {
                self.core.deleteNode(existingAcmNodeWithSameId);
                msg = "Deleted existing AVMComponent with ID '" + id + "'";
                self.logger.warning(msg);
                self.createMessage(existingAcmParentFolder, msg, 'debug');
            } else {
                msg = "Found existing AVMComponent with ID '" + id + "'";
                self.logger.warning(msg);
                self.createMessage(existingAcmNodeWithSameId, msg, 'warning');
            }
        }

        self.logger.debug("Creating new ACM: " + name);
        newAcmNode = self.core.createNode({parent: acmFolderNode, base: MetaTypes.AVMComponentModel });
        self.id2ComponentMap[id] = newAcmNode;
        self.id2NodeMap = {};

        if (avmComponent.hasOwnProperty('Classifications') && avmComponent['Classifications']['#text']) {
            self.core.setAttribute(newAcmNode, 'Classifications', avmComponent['Classifications']['#text']);
        }

        self.core.setAttribute(newAcmNode, 'name', name);
        self.core.setAttribute(newAcmNode, 'SchemaVersion', schemaVersion);
        self.core.setAttribute(newAcmNode, 'Version', version);
        self.core.setAttribute(newAcmNode, 'ID', id);
        self.core.setAttribute(newAcmNode, 'Resource', hash);

        if (avmComponent.hasOwnProperty('Connector')) {
            avmConnectors = avmComponent['Connector'];

            for (i = 0; i < avmConnectors.length; i += 1) {
                self.createNewConnector(avmConnectors[i], newAcmNode);
            }
        }
        if (avmComponent.hasOwnProperty('Port')) {
            avmPorts = avmComponent['Port'];

            for (i = 0; i < avmPorts.length; i += 1) {
                self.createNewDomainPort(avmPorts[i], newAcmNode);
            }
        }
        if (avmComponent.hasOwnProperty('Property')) {
            avmProperties = avmComponent['Property'];

            for (i = 0; i < avmProperties.length; i += 1) {
                self.createNewProperty(avmProperties[i], newAcmNode);
            }
        }
        if (avmComponent.hasOwnProperty('DomainModel')) {
            avmDomainModels = avmComponent['DomainModel'];

            for (i = 0; i < avmDomainModels.length; i += 1) {
                self.createNewDomainModel(avmDomainModels[i], newAcmNode);
            }
        }
        if (avmComponent.hasOwnProperty('Formula')) {
            formulas = avmComponent['Formula'];

            for (i = 0; i < formulas.length; i += 1) {
                self.createNewFormula(formulas[i], newAcmNode);
            }
        }

        // make value flow connections
        self.makeValueFlows(self.valueFlowIdMap, newAcmNode);

        return newAcmNode;
    };

    AcmImporter.prototype.createNewDomainModel = function (avmDomainModelInfo, newAcmNode) {
        var self = this,
            newDomainModelNode,
            domainModelName = avmDomainModelInfo['@Name'],
            domainModelType,
            xPos = parseInt(avmDomainModelInfo['@XPosition'], 10),
            yPos = parseInt(avmDomainModelInfo['@YPosition'], 10),
            modelicaClass;

        newDomainModelNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.DomainModel });
        self.core.setAttribute(newDomainModelNode, 'name', domainModelName);
        self.core.setRegistry(newDomainModelNode, 'position', {x: xPos, y: yPos});

        if (avmDomainModelInfo.hasOwnProperty('@xsi:type')) {
            domainModelType = avmDomainModelInfo['@xsi:type'];

            if (domainModelType === 'modelica:ModelicaModel') {
                self.core.setAttribute(newDomainModelNode, 'Type', 'Modelica');
            } else if (domainModelType === 'cad:CADModel') {
                self.core.setAttribute(newDomainModelNode, 'Type', 'CAD');
            } else if (domainModelType.indexOf('Manufacturing') > -1) {
                self.core.setAttribute(newDomainModelNode, 'Type', 'Manufacturing');
            } else if (domainModelType.indexOf('Cyber') > -1) {
                self.core.setAttribute(newDomainModelNode, 'Type', 'Cyber');
            }
        }

        if (avmDomainModelInfo.hasOwnProperty('@Class')) {
            modelicaClass = avmDomainModelInfo['@Class'];
            self.core.setAttribute(newDomainModelNode, 'Class', modelicaClass);
        }
    };

    AcmImporter.prototype.createNewConnector = function (avmConnInfo, newAcmNode) {
        var self = this,
            connName = avmConnInfo['@Name'],
            connId = avmConnInfo['@ID'],
            xPos = parseInt(avmConnInfo['@XPosition'], 10),
            yPos = parseInt(avmConnInfo['@YPosition'], 10),
            domainConns,
            newConnectorNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.Connector }),
            newDomainConnNode,
            i;

        self.core.setAttribute(newConnectorNode, 'name', connName);
        self.core.setAttribute(newConnectorNode, 'ID', connId);
        self.core.setRegistry(newConnectorNode, 'position', {x: xPos, y: yPos});

        if (avmConnInfo.hasOwnProperty('Role')) {
            domainConns = avmConnInfo['Role'];

            for (i = 0; i < domainConns.length; i += 1) {
                newDomainConnNode = self.createNewDomainPort(domainConns[i], newConnectorNode);

                self.core.setRegistry(newDomainConnNode, 'position', {x: 200, y: 200 + 100 * i});
            }
        }

        return newConnectorNode;
    };

    AcmImporter.prototype.createNewDomainPort = function (domainConnInfo, parentNode) {
        var self = this,
            domainConnName = domainConnInfo['@Name'],
            portID = domainConnInfo['@ID'],
            domainConnType,
            newDomainConnNode = self.core.createNode({parent: parentNode, base: MetaTypes.DomainPort });

        if (domainConnInfo.hasOwnProperty('@xsi:type')) {
            domainConnType = domainConnInfo['@xsi:type'];

            if (domainConnType === 'modelica:Connector') {
                self.core.setAttribute(newDomainConnNode, 'Type', 'ModelicaConnector');

                if (domainConnInfo.hasOwnProperty('@Class')) {
                    self.core.setAttribute(newDomainConnNode, 'Class', domainConnInfo['@Class']);
                }
            } else if (domainConnType.indexOf('Axis') > -1) {
                self.core.setAttribute(newDomainConnNode, 'Type', 'CadAxis');
            } else if (domainConnType.indexOf('CoordinateSystem') > -1) {
                self.core.setAttribute(newDomainConnNode, 'Type', 'CadCoordinateSystem');
            } else if (domainConnType.indexOf('Plane') > -1) {
                self.core.setAttribute(newDomainConnNode, 'Type', 'CadPlane');
            } else if (domainConnType.indexOf('Point') > -1) {
                self.core.setAttribute(newDomainConnNode, 'Type', 'CadPoint');
            }
        }

        self.core.setAttribute(newDomainConnNode, 'name', domainConnName);
        self.core.setAttribute(newDomainConnNode, 'ID', portID);

        return newDomainConnNode;
    };

    AcmImporter.prototype.createNewProperty = function (avmPropInfo, newAcmNode) {
        var self = this,
            propName = avmPropInfo['@Name'],
            propId = avmPropInfo['@ID'],
            xPos = parseInt(avmPropInfo['@XPosition'], 10),
            yPos = parseInt(avmPropInfo['@YPosition'], 10),
            avmValueInfo = self.getPropertyValue(avmPropInfo['Value']),
            dataType = avmPropInfo['Value']['@DataType'],
            newAcmPropertyNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.Property });
        if (avmPropInfo['Value']['@Unit']) {
            self.core.setAttribute(newAcmPropertyNode, 'Unit', avmPropInfo['Value']['@Unit']);
        }
        self.core.setAttribute(newAcmPropertyNode, 'name', propName);
        self.core.setAttribute(newAcmPropertyNode, 'ID', propId);
        self.core.setAttribute(newAcmPropertyNode, 'Value', avmValueInfo.value);
        self.core.setAttribute(newAcmPropertyNode, 'Minimum', avmValueInfo.min);
        self.core.setAttribute(newAcmPropertyNode, 'Maximum', avmValueInfo.max);
        self.core.setAttribute(newAcmPropertyNode, 'ValueType', avmValueInfo.type);
        self.core.setAttribute(newAcmPropertyNode, 'DataType', dataType);
        self.core.setRegistry(newAcmPropertyNode, 'position', {x: xPos, y: yPos});

        //self.propertyJson[propName] = avmPropInfo['Value'];

        self.id2NodeMap[propId] = newAcmPropertyNode;
        if (avmPropInfo.Value) {
            self.id2NodeMap[avmPropInfo.Value['@ID']] = newAcmPropertyNode;
        }
    };

    AcmImporter.prototype.getPropertyValue = function (avmValueObject) {
        var self = this,
            avmPropValueExpression,
            valueType,
            valueInfo = {
                min: '-inf',
                max: 'inf',
                default: '',
                value: '',
                type: 'Fixed'
            },
            srcId = 'src',
            dstId = 'dst';

        var getValueText = function (valueObject) {
            var valueAndText;

            if (valueObject.hasOwnProperty('Value')) {
                valueAndText = valueObject.Value;

                if (valueAndText.hasOwnProperty('#text')) {
                    return valueAndText['#text'];
                } else {
                    return '\'#text\' not found';
                }
            }
        };

        if (avmValueObject.hasOwnProperty('ValueExpression')) {
            avmPropValueExpression = avmValueObject['ValueExpression'];

            if (avmPropValueExpression.hasOwnProperty('@xsi:type')) {
                valueType = avmPropValueExpression['@xsi:type'];

                if (valueType === 'avm:ParametricValue') {
                    valueInfo.type = 'Parametric';

                    if (avmPropValueExpression.hasOwnProperty('Minimum')) {
                        valueInfo.min = getValueText(avmPropValueExpression.Minimum);
                    }
                    if (avmPropValueExpression.hasOwnProperty('Maximum')) {
                        valueInfo.max = getValueText(avmPropValueExpression.Maximum);
                    }
                    if (avmPropValueExpression.hasOwnProperty('AssignedValue')) {
                        valueInfo.value = getValueText(avmPropValueExpression.AssignedValue);
                    }
                    if (avmPropValueExpression.hasOwnProperty('Default')) {
                        valueInfo.default = getValueText(avmPropValueExpression.Default);
                    } else {
                        valueInfo.default = valueInfo.value;
                    }
                } else if (valueType === 'avm:FixedValue') {
                    valueInfo.value = getValueText(avmPropValueExpression);
                    valueInfo.default = valueInfo.value;
                } else if (valueType === 'avm:DerivedValue') {
                    if (avmValueObject.hasOwnProperty('@ID')) {
                        dstId = avmValueObject['@ID'];
                    }
                    if (avmPropValueExpression.hasOwnProperty('@ValueSource')) {
                        srcId = avmPropValueExpression['@ValueSource'];
                    }

                    if (self.valueFlowIdMap.hasOwnProperty(srcId)) {
                        self.valueFlowIdMap[srcId].push(dstId);
                    }
                    else {
                        self.valueFlowIdMap[srcId] = [dstId];
                    }
                }
            }
        }

        valueInfo.value = valueInfo.value || '';
        return valueInfo;
    };

    AcmImporter.prototype.createNewFormula = function (avmFormulaInfo, newAcmNode) {
        var self = this,
            formulaName = avmFormulaInfo['@Name'],
            formulaId = avmFormulaInfo['@ID'],
            xPos = parseInt(avmFormulaInfo['@XPosition'], 10),
            yPos = parseInt(avmFormulaInfo['@YPosition'], 10),
            formulaType = avmFormulaInfo['@xsi:type'],
            operationType,
            expression,
            operand,
            sourceIDs,
            sourceID,
            newFormulaNode,
            i;

        if (formulaType === 'avm:SimpleFormula') {
            newFormulaNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.SimpleFormula});

            if (avmFormulaInfo.hasOwnProperty('@Operation')) {
                operationType = avmFormulaInfo['@Operation'];
                self.core.setAttribute(newFormulaNode, 'Method', operationType);
            }
            if (avmFormulaInfo.hasOwnProperty('@Operand')) {
                operand = avmFormulaInfo['@Operand'];
                sourceIDs = operand.split(' ');

                for (i = 0; i < sourceIDs.length; i += 1) {
                    if (self.valueFlowIdMap.hasOwnProperty(sourceIDs[i])) {
                        self.valueFlowIdMap[sourceIDs[i]].push(formulaId);
                    } else {
                        self.valueFlowIdMap[sourceIDs[i]] = [formulaId];
                    }
                }
            }
        } else if (formulaType === 'avm:ComplexFormula') {
            newFormulaNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.CustomFormula});

            if (avmFormulaInfo.hasOwnProperty('@Expression')) {
                expression = avmFormulaInfo['@Expression'];
                self.core.setAttribute(newFormulaNode, 'Expression', expression);
            }
            if (avmFormulaInfo.hasOwnProperty('Operand')) {
                operand = avmFormulaInfo['Operand'];

                for (i = 0; i < operand.length; i += 1) {
                    if (operand[i].hasOwnProperty('@ValueSource')) {
                        sourceID = operand[i]['@ValueSource'];

                        if (self.valueFlowIdMap.hasOwnProperty(sourceID)) {
                            self.valueFlowIdMap[sourceID].push(formulaId);
                        } else {
                            self.valueFlowIdMap[sourceID] = [formulaId];
                        }
                    }
                }
            }
        }

        self.core.setAttribute(newFormulaNode, 'name', formulaName);
        self.core.setRegistry(newFormulaNode, 'position', {x: xPos, y: yPos});

        self.id2NodeMap[formulaId] = newFormulaNode;
    };

    AcmImporter.prototype.makeValueFlows = function (valueFlowMap, newAcmNode) {
        var self = this,
            newValueFlowNode,
            srcId,
            dstIds,
            dstId,
            srcNode,
            dstNode;

        for (srcId in valueFlowMap) {
            if (self.id2NodeMap.hasOwnProperty(srcId)) {
                srcNode = self.id2NodeMap[srcId];
            } else {
                continue;
            }

            dstIds = valueFlowMap[srcId];

            for (var i = 0; i < dstIds.length; i += 1) {
                dstId = dstIds[i];

                if (self.id2NodeMap.hasOwnProperty(dstId)) {
                    dstNode = self.id2NodeMap[dstId];

                    newValueFlowNode = self.core.createNode({parent: newAcmNode, base: MetaTypes.ValueFlowComposition});
                    self.core.setPointer(newValueFlowNode, 'src', srcNode);
                    self.core.setPointer(newValueFlowNode, 'dst', dstNode);
                } else {
                    continue;
                }
            }
        }
    };

    AcmImporter.prototype.getAcmDetails = function (fileHash, getAcmCallback) {
        var self = this,
            blobGetMetadataCallback = function (getMetadataErr, metadata) {
                if (getMetadataErr) {
                    getAcmCallback(getMetadataErr);
                    return;
                }

                var content = metadata['content'],
                    contentName = metadata['name'],
                    contentType = metadata['contentType'],
                    single = false,
                    multi = false,
                    hashToAcmJsonMap = {},
                    blobGetObjectCallback;

                if (contentType === 'complex') {
                    multi = true;
                } else if (contentType === 'object' && contentName.indexOf('.zip') > -1) {
                    single = true;
                } else {
                    var msg = 'Uploaded file "' + contentName + '" was not valid.';
                    self.createMessage(self.activeNode, msg, 'error');
                    self.logger.error(msg);
                    getAcmCallback(msg);
                    return;
                }

                blobGetObjectCallback = function (getObjectErr, uploadedObjContent) {
                    if (getObjectErr) {
                        getAcmCallback(getObjectErr);
                        return;
                    }

                    var zipFile = new JSZip(uploadedObjContent),
                        acmObjects,
                        acmObject,
                        acmContent,
                        acmZipFileName,
                        acmHash,
                        acmZipFile,
                        numberAcmFiles,
                        acmJson;

                    if (single) {
                        acmJson = self.getAcmJsonFromZip(zipFile, contentName);

                        if (acmJson != null) {
                            hashToAcmJsonMap[fileHash] = acmJson;
                        }

                        //hashToAcmJsonMap[fileHash] = self.getAcmJsonFromZip(zipFile, contentName);

                    } else if (multi) {

                        acmObjects = zipFile.file(/\.zip/);
                        numberAcmFiles = acmObjects.length;

                        for (var i = 0; i < numberAcmFiles; i += 1) {
                            acmObject = acmObjects[i];
                            acmZipFileName = acmObject.name;
                            acmContent = acmObject.asArrayBuffer();
                            acmZipFile = new JSZip(acmContent);
                            acmHash = content[acmZipFileName].content;  // blob 'soft-link' hash

                            acmJson = self.getAcmJsonFromZip(acmZipFile, acmZipFileName);

                            if (acmJson != null) {
                                hashToAcmJsonMap[acmHash] = acmJson;
                            }
                        }

                    }

                    getAcmCallback(null, hashToAcmJsonMap);
                };

                self.blobClient.getObject(fileHash, blobGetObjectCallback);
            };

        self.blobClient.getMetadata(fileHash, blobGetMetadataCallback);
    };

    AcmImporter.prototype.getAcmJsonFromZip = function (acmZip, acmZipName) {
        var self = this,
            converterResult,
            acmName = acmZipName.split('.')[0],
            acmXml = acmZip.file(/\.acm/),
            msg;

        if (acmXml.length === 1) {
            converterResult = self.convertXmlString2Json(acmXml[0].asText());

            if (converterResult instanceof Error) {
                msg = '.acm file in "' + acmZipName + '" is not a valid xml.';
                self.logger.error(msg);
                self.createMessage(null, msg, 'error');
                self.cleanImport = false;
                return null;
            } else {
                return converterResult;
            }
        } else if (acmXml.length === 0) {
            msg = 'No .acm file found inside ' + acmZipName + '.';
            self.logger.error(msg);
            self.createMessage(null, msg, 'error');
            self.cleanImport = false;
            return null;
        } else {
            msg = 'Found multiple .acm files in ' + acmZipName + '. Only one was expected.';
            self.logger.error(msg);
            self.createMessage(null, msg, 'error');
            converterResult = self.convertXmlString2Json(acmXml[0].asText());

            if (converterResult instanceof Error) {
                msg = '.acm file in ' + acmZipName + ' is not a valid xml.';
                self.logger.error(msg);
                self.createMessage(null, msg, 'error');
                self.cleanImport = false;
                return null;
            } else {
                return converterResult;
            }
        }
    };

    AcmImporter.prototype.convertXmlString2Json = function (acmXmlString) {
        var self = this,
            converter = new Xml2Json.Xml2json({
                skipWSText: true,
                arrayElements: {
                    Property: true,
                    Connector: true,
                    DomainModel: true,
                    Role: true,
                    Formula: true,
                    Operand: true,
                    Port: true
                }
            });

        return converter.convertFromString(acmXmlString);
    };

    return AcmImporter;
});