/* globals module, require, requireJS */
'use strict';


var xmljsonconverter = requireJS('xmljsonconverter'),
    q = require('q'),
    JSZip = requireJS('jszip'),
    commonmark = require('commonmark');

    var ParseAcm = function (id) {
        this.id = id;
    };

    function endsWith(input, suffix) {
        return input.lastIndexOf(suffix) === (input.length - suffix.length);
    }

    ParseAcm.prototype.getfile = function getfile(path) {
        var self = this;
        return this.getAcmZip()
            .then(function (acmXmlZip) {
                var acmZip = new JSZip(acmXmlZip);

                return acmZip.file(path).asNodeBuffer();
            });
    };

    ParseAcm.prototype.parse = function parseAcm() {
        var self = this;
        return this.getAcmZip()
            .then(function (acmXmlZip) {
                var acmZip = new JSZip(acmXmlZip),
                    filterZipList = function (ar) {
                        return ar.filter(function (entry) {
                            return entry.name.indexOf('__MACOSX') !== 0;
                        });
                    },
                    acmXml = filterZipList(acmZip.file(/\.acm$/));

                if (acmXml.length !== 1) {
                    return q.reject('zip must contain exactly 1 acm');
                }

                var acmJson = self.convertAcmToJson(acmXml[0].asText()),
                    component = acmJson.Component,
                    acmInfo = {};


                //console.log(JSON.stringify(component, null, 4));

                (function setIcon() {
                    var icon = component.ResourceDependency.filter(function (dependency) {
                        return endsWith(dependency['@Path'].toLowerCase(), 'icon.png');
                    })[0];
                    if (icon && icon['@Path']) {
                        var path = icon['@Path'].replace('\\', '/');
                        if (acmZip.file(path)) {
                            acmInfo.icon = 'data:image/png;base64,' + acmZip.file(path).asNodeBuffer().toString('base64');
                        }
                    }
                })();

                (function setDatasheet() {
                    var dependency = component.ResourceDependency.filter(function (dep) {
                        return endsWith(dep['@Path'].toLowerCase(), '.pdf');
                    })[0];
                    if (dependency && dependency['@Path']) {
                        var path = dependency['@Path'].replace('\\', '/');
                        if (acmZip.file(path)) {
                            acmInfo.datasheet = self.getDatasheetUrl(path);
                        }
                    }
                })();

                (function setMarkdown() {
                    var dependency = component.ResourceDependency.filter(function (dep) {
                        return endsWith(dep['@Path'].toLowerCase(), '.md') || endsWith(dep['@Name'].toLowerCase(), '.mdown');
                    })[0];
                    if (dependency && dependency['@Path']) {
                        var path = dependency['@Path'].replace('\\', '/');
                        if (acmZip.file(path)) {
                            var reader = new commonmark.Parser();
                            var writer = new commonmark.HtmlRenderer();
                            var parsed = reader.parse(acmZip.file(path).asText());
                            acmInfo.documentation = writer.render(parsed);
                        }
                    }
                })();

                (function setProperties() {
                    acmInfo.properties = {};
                    (component.Property || []).forEach(function (prop) {
                        var propInfo = acmInfo.properties[prop['@Name']] = {};
                        if (prop.Value && prop.Value.ValueExpression && prop.Value.ValueExpression.Value) {
                            propInfo.value = prop.Value.ValueExpression.Value['#text'];
                        } else if (prop.Value && prop.Value.ValueExpression && prop.Value.ValueExpression.AssignedValue && prop.Value.ValueExpression.AssignedValue.Value) {
                            propInfo.value = prop.Value.ValueExpression.AssignedValue.Value['#text'];
                        } else if (prop.Value && prop.Value.ValueExpression && prop.Value.ValueExpression.Default && prop.Value.ValueExpression.Default.Value) {
                            propInfo.value = prop.Value.ValueExpression.Default.Value['#text'];
                        }
                    });
                })();

                acmInfo.name = acmJson.Component['@Name'] || self.id;
                acmInfo.classification = acmJson.Component.Classifications['#text'];

                return acmInfo;
            });
    };

    ParseAcm.prototype.getAcmZip = function () {
        throw new Error('must be overridden. return a q promise');
    };

    ParseAcm.prototype.convertAcmToJson = function convertAcmToJson(acmXmlString) {
        var converter = new xmljsonconverter.Xml2json({
            skipWSText: true,
            arrayElements: {
                Property: true,
                Connector: true,
                DomainModel: true,
                Role: true,
                Formula: true,
                Operand: true,
                Port: true,
                ResourceDependency: true
            }
        });

        return converter.convertFromString(acmXmlString);
    };

    module.exports = ParseAcm;