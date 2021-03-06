(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

require("./directives/componentBrowser/componentBrowser");
require("./services/componentLibrary.js");
require("./appConfig");

angular.module("mms.componentBrowserApp", ["mms.componentBrowser", "mms.componentBrowser.config", "mms.componentBrowser.componentLibrary", "ngMaterial"]).config(function (componentLibraryProvider, componentServerUrl) {
    if (componentServerUrl.indexOf("http") !== 0) {
        componentServerUrl = window.location.origin + componentServerUrl;
    }
    componentLibraryProvider.setServerUrl(componentServerUrl);
}).controller("AppController", function ($scope) {

    $scope.itemDragStart = function (e, item) {
        console.log("Dragging", e, item);
    };

    $scope.itemDragEnd = function (e, item) {
        console.log("Finish dragging", e, item);
    };
});
/*globals angular*/
/**
 * Created by blake on 2/9/15.
 */

},{"./appConfig":3,"./directives/componentBrowser/componentBrowser":5,"./services/componentLibrary.js":20}],2:[function(require,module,exports){
"use strict";

require("../componentBrowser/services/componentLibrary.js");
require("../subcircuitBrowser/services/subcircuitLibrary.js");

module.exports = function ($scope, contentLibraryService) {

    var self, config, formatProperties, itemGenerator;

    self = this;

    config = {

        sortable: false,
        secondaryItemMenu: false,
        detailsCollapsible: false,
        showDetailsLabel: "Show details",
        hideDetailsLabel: "Hide details",
        noDownload: self.noDownload,

        // Event handlers

        itemSort: function itemSort(jQEvent, ui) {
            console.log("Sort happened", jQEvent, ui);
        },

        itemClick: function itemClick(event, item) {
            console.log("Clicked: " + item);
        },

        itemDownload: function itemDownload(event, item) {
            contentLibraryService.downloadItem(item.id);
        },

        itemInfo: function itemInfo(event, item) {

            var url, win;

            if (item.octopart) {
                url = "http://octopart.com/search?q=" + item.octopart + "&view=list";
            } else if (item.subcircuitSourceURL) {
                url = item.subcircuitSourceURL;
            }

            if (url) {

                win = window.open(url, "_blank");
                win.focus();
            }
        },

        itemContextmenuRenderer: function itemContextmenuRenderer(e, item) {

            var menu;

            if (!self.noDownload) {

                menu = [{
                    items: [{
                        id: "download",
                        label: "Download item",
                        disabled: false,
                        action: function action() {
                            contentLibraryService.downloadItem(item.id);
                        },
                        actionData: item,
                        iconClass: "fa fa-plus"
                    }]
                }];
            }

            return menu;
        },

        detailsRenderer: function detailsRenderer(item) {
            item.details = "My details are here now!";
        }

    };

    formatProperties = function (item, itemClass) {
        var res = [],
            properties = {},
            pp,
            i,
            prop,
            key;

        if (item[itemClass + "Properties"] === undefined) {
            pp = item.prominentProperties;
            //  add non-prominent properties
            if (item.otherProperties !== undefined && item.otherProperties !== null) {
                if (pp === undefined || pp === null) {
                    pp = item.otherProperties;
                } else {
                    pp = pp.concat(item.otherProperties);
                }
            }

            if (pp !== undefined && pp !== null) {
                for (i in pp) {
                    prop = pp[i];
                    if (prop.name !== undefined && prop.value !== undefined) {
                        if (prop.name !== capitalizeFirstLetter(itemClass) + "Name") {
                            properties[prop.name] = prop.value;
                            if (prop.units !== undefined) {
                                properties[prop.name] += " " + prop.units;
                            }
                        }
                    } else {
                        for (key in prop) {
                            if (key !== "id") {
                                properties[prop.name] = prop[key];
                            }
                        }
                    }
                }
            }
        } else {
            pp = item[itemClass + "Properties"];
            if (pp !== undefined && pp !== null) {
                for (i in pp) {
                    prop = pp[i];
                    if (prop.name !== undefined && prop.stringValue !== undefined) {
                        if (prop.name !== capitalizeFirstLetter(itemClass) + "Name") {
                            properties[prop.name] = prop.stringValue;
                            if (prop.units !== undefined) {
                                properties[prop.name] += " " + prop.units;
                            }
                        }
                    }
                }
            }
        }

        var sortedPropKeys = Object.keys(properties).sort(),
            j;

        for (j = 0; j < sortedPropKeys.length; j++) {

            res.push({
                name: sortedPropKeys[j],
                value: properties[sortedPropKeys[j]]
            });
        }

        return res;
    };

    itemGenerator = function (item, itemClass, templateUrlBase) {

        var details = {
            properties: formatProperties(item, itemClass),
            markdown: null,
            documentation: {
                id: item.id,
                description: item.description,
                connectors: item.connectors,
                visuals: null,
                icon: null
            }
        };

        if (item.iconFileName) {
            details.documentation.icon = contentLibraryService.getServerUrl() + "/component_files/" + item.iconFileName;
        }

        return {
            id: item.id,
            title: item.name.replace(/_/g, " "),
            toolTip: "Open item",
            headerTemplateUrl: templateUrlBase + "itemHeader.html",
            detailsTemplateUrl: templateUrlBase + "itemDetail.html",
            details: details,
            subcircuitSourceURL: item.subcircuitSourceURL
        };
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return { config: config,
        itemGenerator: itemGenerator };
};

},{"../componentBrowser/services/componentLibrary.js":20,"../subcircuitBrowser/services/subcircuitLibrary.js":22}],3:[function(require,module,exports){
"use strict";

/*globals angular*/
angular.module("mms.componentBrowser.config", []).constant("componentServerUrl", "http://localhost:3000");

},{}],4:[function(require,module,exports){
"use strict";

angular.module("mms.contentBrowser.categoryResizer", ["ngCookies"]).directive("categoryResizer", function ($cookies, $timeout) {

    function ResizerController() {

        this._startingWidth = 300;
        this._minWidth = 200;
        this._maxWidth = 500;

        this._panelDragging = false;
        this._potentialPanelDragStart = null;
        this._widthBeforePanelDragging = null;

        this._widthAllowance = null;
    }

    ResizerController.prototype.getWidth = function () {
        return this._width;
    };

    ResizerController.prototype.setWidth = function (width) {

        if (!isNaN(width) && width >= this._minWidth && width <= this._maxWidth) {

            this._width = width;

            this._updateResizerPosition();

            if (this._categoryPanelEl) {
                this._categoryPanelEl.style.width = Math.floor(this._width) + "px";
            }

            if (this._detailPanelEl) {
                this._detailPanelEl.style.width = Math.floor(this._widthAllowance - this._width) + "px";
            }

            $timeout(function () {
                $cookies.categoryWidth = width;
            });
        } else {
            this._stopPanelDragging();
        }
    };

    ResizerController.prototype._updateResizerPosition = function () {

        this._resizerEl.style.left = this._width + "px";
    };

    ResizerController.prototype._init = function () {

        this._widthAllowance = parseInt(getComputedStyle(this._resizerEl.parentElement).width.slice(0, -2), 10);
        this.setWidth(this._startingWidth);
    };

    ResizerController.prototype.panelMouseDown = function ($event) {

        if (!this._panelDragging) {
            this._potentialPanelDragStart = $event.clientX;
            $event.preventDefault();
        }
    };

    ResizerController.prototype._startPanelDragging = function () {

        this._panelDragging = true;
        this._widthBeforePanelDragging = this.getWidth();
        this._widthAllowance = parseInt(getComputedStyle(this._resizerEl.parentElement).width.slice(0, -2), 10);
    };

    ResizerController.prototype._stopPanelDragging = function () {
        this._panelDragging = false;
    };

    ResizerController.prototype._resizerMouseUp = function () {

        this._potentialPanelDragStart = null;

        if (this._panelDragging) {
            this._stopPanelDragging();
        }
    };

    ResizerController.prototype._resizerMouseMove = function ($event) {

        var newwidth, offset;

        if (!this._panelDragging && this._potentialPanelDragStart != null) {
            this._startPanelDragging();
        }

        if (this._panelDragging) {

            newwidth = this._widthBeforePanelDragging + ($event.clientX - this._potentialPanelDragStart);

            offset = Math.min(newwidth, this._widthAllowance) - this._width;

            this.setWidth(Math.min(newwidth, this._widthAllowance), offset);
        }
    };

    ResizerController.prototype._correctResizerHeight = function () {
        this._resizerEl.style.height = this._categoryPanelEl.style.height;
    };

    return {
        restrict: "E",
        scope: true,
        controller: ResizerController,
        controllerAs: "ctrl",
        bindToController: true,
        replace: true,
        transclude: true,
        templateUrl: "/componentBrowser/templates/categoryResizer.html",
        require: ["categoryResizer"],
        link: function link(scope, element, attributes, controllers) {

            var ctrl = controllers[0],
                boundResizerMouseUp = ctrl._resizerMouseUp.bind(ctrl),
                boundResizerMouseMove = ctrl._resizerMouseMove.bind(ctrl),
                boundParentWindowResize = ctrl._init.bind(ctrl),
                parentElement;

            ctrl._resizerEl = element[0];

            if ($cookies.categoryWidth && !isNaN($cookies.categoryWidth)) {
                ctrl._startingWidth = parseInt($cookies.categoryWidth, 10);
            } else if (attributes.startingWidth && !isNaN(attributes.startingWidth)) {
                ctrl._startingWidth = attributes.startingWidth;
            }

            if (attributes.minWidth && !isNaN(attributes.minWidth)) {
                ctrl._minWidth = attributes.minWidth;
            }

            if (attributes.maxWidth && !isNaN(attributes.maxWidth)) {
                ctrl._maxWidth = attributes.maxWidth;
            }

            parentElement = ctrl._resizerEl.parentElement;

            ctrl._categoryPanelEl = parentElement.querySelector(".left-panel");
            ctrl._detailPanelEl = parentElement.querySelector(".main-container-panel");

            ctrl._init();

            ctrl._padding = parseInt(getComputedStyle(ctrl._resizerEl).width.slice(0, -2), 10);

            document.addEventListener("mouseup", boundResizerMouseUp);
            document.addEventListener("mousemove", boundResizerMouseMove);
            window.addEventListener("resize", boundParentWindowResize);

            if (ctrl._categoryPanelEl) {
                ctrl._correctResizerHeight();
            }

            scope.$on("$destroy", function () {

                if (ctrl._resizerEl) {
                    document.removeEventListener("mouseup", boundResizerMouseUp);
                    document.removeEventListener("mousemove", boundResizerMouseMove);
                    window.removeEventListener("resize", boundParentWindowResize);
                }
            });
        }
    };
});
/*global angular*/

},{}],5:[function(require,module,exports){
"use strict";

require("../componentCategories/componentCategories.js");
require("../componentSearch/componentSearch.js");
require("../componentListing/componentListing.js");
require("../../services/componentLibrary.js");
require("../categoryResizer/categoryResizer.js");

angular.module("mms.componentBrowser", ["mms.componentBrowser.templates", "mms.componentBrowser.componentCategories", "mms.componentBrowser.componentSearch", "mms.componentBrowser.componentListing", "mms.componentBrowser.componentLibrary", "mms.contentBrowser.categoryResizer", "ngCookies"]).directive("componentBrowser", function () {

    function ComponentBrowserController($scope, componentLibrary, $log, $anchorScroll, $timeout, $cookies, $location) {

        var self, updateList, noSearchResults, loadState;

        self = this;

        this.appBooting = false;

        this.embedded = false;

        this.persistState = false;

        this.persistStateInUrl = false;

        this.selectedCategory = null;

        this.errorMessage = null;

        this.filtered = false;

        this.resultsForSearchText = null;

        this.componentsToList = null;

        this.searchText = null;

        this.facetedSearch = null; // the json for faceted search

        this.columnSearchText = {};

        this.listingView = "ListView";

        this.columnSortInfo = [];

        this.lockGridColumns = false; // faceted search locks grid columns so they don't jump around while you are searching

        this.setFacetedSearch = function (fs) {
            self.facetedSearch = fs;
        };

        this.onCategorySelectionChange = function () {

            self.searchText = null;
            self.resultsForSearchText = null;

            self.pagingParameters.cursor = 0;
            self.filtered = false;

            $anchorScroll();

            updateList();

            self.saveState();
        };

        this.pagingParameters = {
            itemsPerPage: 20,
            cursor: 0
        };

        this.setItemsPerPage = function (ipp) {
            self.pagingParameters.itemsPerPage = ipp;
            updateList();
        };

        this.getNextPage = function () {

            var nextCursor;

            // console.log('next');

            nextCursor = self.pagingParameters.cursor + self.pagingParameters.itemsPerPage;

            if (nextCursor < self.pagingParameters.totalCount) {

                self.pagingParameters.cursor = nextCursor;
                updateList();
            }

            self.saveState();
        };

        this.getPrevPage = function () {

            // console.log('prev');

            self.pagingParameters.cursor = Math.max(self.pagingParameters.cursor - self.pagingParameters.itemsPerPage, 0);

            updateList();

            self.saveState();
        };

        this.newData = function (results) {
            // console.log('Search results', results);
            if (results.component.length === 0 && self.facetedSearch === null) {
                noSearchResults();

                self.saveState();

                return;
            }
            self.componentsToList = results.component;

            self.pagingParameters.cursor = 0;
            self.pagingParameters.fromNumber = 1;
            self.pagingParameters.totalCount = results.total;

            self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);

            self.filtered = true;
            self.resultsForSearchText = self.searchText;

            self.saveState();
        };

        this.getSearchResults = function () {
            componentLibrary.searchComponents(self.selectedCategory && self.selectedCategory.path || "!", self.searchText, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor, self.facetedSearch).then(self.newData)["catch"](function (e) {
                $log.warn("No results:", e);
                self.componentsToList = null;
                noSearchResults();
            });
        };

        loadState = function () {

            var state, locationSearchObject;

            if (self.persistState && $cookies.componentBrowserState) {

                state = JSON.parse($cookies.componentBrowserState);

                angular.extend(self, state);
            }

            if (self.persistStateInUrl) {

                locationSearchObject = $location.search();

                if (locationSearchObject && typeof locationSearchObject.s === "string") {

                    state = JSON.parse(locationSearchObject.s);

                    angular.extend(self, state);
                }
            }
        };

        this.onListingViewSelection = function (view) {

            self.listingView = view;
            self.saveState();
        };

        this.saveState = function () {

            var state = {};

            if (this.persistState || this.persistStateInUrl) {

                //state.searchText = this.searchText; // TODO: make this work
                //state.pagingParameters = this.pagingParameters; // TODO: make this work
                //state.columnSearchText = this.columnSearchText; // TODO: make this work

                state.selectedCategory = this.selectedCategory; // TODO: make tree navigate to category
                state.listingView = this.listingView;

                var stateObjectJSON = JSON.stringify(state);

                if (this.persistState) {
                    $cookies.componentBrowserState = stateObjectJSON;
                }

                if (this.persistStateInUrl) {
                    $location.search({ s: stateObjectJSON });
                }
            }
        };

        noSearchResults = function () {
            self.pagingParameters.cursor = 0;
            self.filtered = false;
            self.componentsToList = null;
            self.errorMessage = "No search results for \"" + self.searchText + "\"";
        };

        updateList = function () {

            self.errorMessage = null;

            if (self.selectedCategory || self.filtered) {

                if (!self.filtered) {

                    angular.extend(self.pagingParameters, {

                        fromNumber: self.pagingParameters.cursor + 1,
                        toNumber: Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.selectedCategory.childComponentsCount),
                        totalCount: self.selectedCategory.childComponentsCount

                    });

                    componentLibrary.getListOfComponents(self.selectedCategory.path, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor).then(function (data) {
                        //console.log('componentsToList: ', data);
                        $timeout(function () {
                            self.componentsToList = data.component;
                        });
                        self.pagingParameters.totalCount = data.total;
                        self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);
                    })["catch"](function (e) {
                        $log.error("Components could not be loaded", e);
                    });
                } else {

                    angular.extend(self.pagingParameters, {

                        fromNumber: self.pagingParameters.cursor + 1,
                        toNumber: Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount)

                    });

                    componentLibrary.searchComponents(self.selectedCategory && self.selectedCategory.path || "!", self.searchText, self.pagingParameters.itemsPerPage, self.pagingParameters.cursor, self.facetedSearch, self.columnSortInfo).then(function (results) {

                        // console.log('Search results', results);
                        if (results.component.length === 0 && self.facetedSearch === null) {
                            noSearchResults();
                            return;
                        }

                        self.componentsToList = results.component;

                        self.pagingParameters.toNumber = Math.min(self.pagingParameters.cursor + self.pagingParameters.itemsPerPage, self.pagingParameters.totalCount);

                        self.filtered = true;
                    })["catch"](function (e) {
                        $log.warn("No results:", e);
                        noSearchResults();
                    });
                }
            }
        };

        //$scope.$watch(function () {
        //    return self.categoryToList;
        //}, function (newValue, oldValue) {
        //
        //    if (newValue && newValue !== oldValue) {
        //        update();
        //    }
        //
        //});

        this.init = function () {

            loadState();
            //this.getSearchResults();
            updateList();
        };
    }

    return {
        restrict: "E",
        scope: {
            selectedView: "=",
            onItemDragStart: "=",
            onItemDragEnd: "="
        },
        replace: true,
        controller: ComponentBrowserController,
        bindToController: true,
        controllerAs: "ctrl",
        templateUrl: "/componentBrowser/templates/componentBrowser.html",
        require: "componentBrowser",
        link: function link(scope, element, attributes, ctrl) {

            if (attributes.hasOwnProperty("embedded")) {
                ctrl.embedded = true;
            } else {
                ctrl.embedded = false;
            }

            if (attributes.hasOwnProperty("persistState")) {
                ctrl.persistState = true;
            } else {
                ctrl.persistState = false;
            }

            if (attributes.hasOwnProperty("persistStateInUrl")) {
                ctrl.persistStateInUrl = true;
            } else {
                ctrl.persistStateInUrl = false;
            }

            if (attributes.hasOwnProperty("noDownload")) {
                ctrl.noDownload = true;
            } else {
                ctrl.noDownload = false;
            }

            var itemsPerPage = parseInt(attributes.listViewItemsPerPage, 10);

            if (!isNaN(itemsPerPage)) {
                ctrl.pagingParameters.itemsPerPage = itemsPerPage;
            }

            ctrl.init();
        }
    };
});
/*global angular*/

},{"../../services/componentLibrary.js":20,"../categoryResizer/categoryResizer.js":4,"../componentCategories/componentCategories.js":6,"../componentListing/componentListing.js":9,"../componentSearch/componentSearch.js":10}],6:[function(require,module,exports){
"use strict";

require("../../services/componentLibrary.js");

angular.module("mms.componentBrowser.componentCategories", ["isis.ui.treeNavigator", "mms.componentBrowser.componentLibrary"]).directive("componentCategories", function () {

    function ComponentCategoriesController($q, componentLibrary, $timeout) {

        var self = this;

        var addData = (function (_addData) {
            var _addDataWrapper = function addData(_x, _x2) {
                return _addData.apply(this, arguments);
            };

            _addDataWrapper.toString = function () {
                return _addData.toString();
            };

            return _addDataWrapper;
        })(function (parent, array) {
            var children = [];
            for (var i in array) {
                var e = array[i];
                var n = addNode(parent, e.label, e.id, i, e);
                children.push(n);
                if (e.subClasses !== undefined) {
                    addData(n, e.subClasses);
                }
            }
            return children;
        });

        var config,
            treeNodes = {},
            addNode;

        addNode = function (parentTreeNode, lbl, id, i, e) {

            var newTreeNode,
                children = [];

            newTreeNode = {
                id: id,
                label: lbl,
                extraInfo: e && !isNaN(e.categoryTotal) && "[" + e.categoryTotal + "]",
                children: children,
                childrenCount: e === undefined ? 0 : e.childCategoriesCount,
                nodeData: {
                    label: lbl,
                    path: e === undefined ? "" : e.id,
                    childComponentsCount: e === undefined ? 0 : e.childComponentsCount
                },
                iconClass: null,

                draggable: false,
                order: i
            };

            // add the new node to the map
            treeNodes[newTreeNode.id] = newTreeNode;

            if (parentTreeNode) {
                // if a parent was given add the new node as a child node
                parentTreeNode.iconClass = undefined;
                parentTreeNode.children.push(newTreeNode);

                //                parentTreeNode.childrenCount = parentTreeNode.children.length;

                if (newTreeNode.childrenCount) {
                    newTreeNode.iconClass = undefined;
                }

                //               sortChildren( parentTreeNode.children );

                newTreeNode.parentId = parentTreeNode.id;
            } else {

                // if no parent is given replace the current root node with this node
                self.treeData = newTreeNode;
                self.treeData.unCollapsible = true;
                newTreeNode.parentId = null;
            }

            return newTreeNode;
        };

        config = {

            scopeMenu: [{
                items: []
            }],

            loadChildren: function loadChildren(e, node) {
                // console.log('loadChildren called:', node);
                var deferred = $q.defer();

                componentLibrary.getClassificationTree(node.nodeData.path).then(function (data) {

                    var children;

                    children = addData(node, data);
                    deferred.resolve(children);
                    self.appBooting = false;
                }, function (data) {

                    if (parseInt(data.status, 10) === 503) {
                        self.appBooting = true;
                    }
                });

                return deferred.promise;
            },

            showRootLabel: false,

            // Tree Event callbacks

            nodeClick: function nodeClick(e, node) {

                self.lockGridColumns = false;

                if (!self.selectedCategory || self.selectedCategory.path !== node.nodeData.path) {

                    self.selectedCategory = node.nodeData;

                    if (angular.isFunction(self.onSelectionChange)) {

                        $timeout(self.onSelectionChange);
                    }
                }
            },

            nodeDblclick: function nodeDblclick(e, node) {
                console.log("Node was double-clicked:", node);
            },

            nodeExpanderClick: function nodeExpanderClick(e, node, isExpand) {
                console.log("Expander was clicked for node:", node, isExpand);
            }

        };

        self.config = config;

        self.config.selectedScope = self.config.scopeMenu[0].items[0];
        self.config.nodeClassGetter = function (node) {
            var nodeCssClass = "";

            if (node.order % 2 === 0) {
                nodeCssClass = "even";
            }

            return nodeCssClass;
        };
        self.treeData = {};
        self.config.state = {
            // id of activeNode
            activeNode: "Node item 0.0",

            // ids of selected nodes
            selectedNodes: ["Node item 0.0"],

            expandedNodes: ["Node item 0", "Node item 0.1"],

            // id of active scope
            activeScope: "project"
        };

        addNode(null, "Components", "Components");
    }

    return {
        restrict: "E",
        controller: ComponentCategoriesController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/componentCategories.html",
        scope: {
            selectedCategory: "=",
            onSelectionChange: "=",
            lockGridColumns: "=",
            appBooting: "="
        }
    };
});
/*global angular*/

/**
 * Created by Blake McBride on 2/9/15.
 */

},{"../../services/componentLibrary.js":20}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var PropertyTable = require("../propertyTable/propertyTable.jsx");
var ConnectorsDescription = require("../../../subcircuitBrowser/directives/subcircuitDetails/ConnectorsDescription.jsx");

angular.module("mms.componentDetails.react", []).directive("componentDetails", function () {

    function ComponentDetailsController() {}

    return {
        restrict: "E",
        controller: ComponentDetailsController,
        controllerAs: "ctrl",
        bindToController: true,
        replace: true,
        transclude: false,
        template: "<div class=\"component-details\"></div>",
        scope: {
            properties: "=",
            details: "="
        },
        require: ["componentDetails"],
        link: function link(scope, element, attr, controllers) {

            var ctrl = controllers[0];

            function cleanup() {
                React.unmountComponentAtNode(element[0]);
            }

            function render() {
                React.render(React.createElement(ComponentDetailsGrid, { details: ctrl.details, properties: ctrl.properties }), element[0]);
            }

            scope.$watch(function () {
                if (ctrl.details) {
                    return ctrl.details;
                }
            }, function (newO, oldO) {

                if ((oldO !== newO || oldO != null) && newO != null) {

                    cleanup();
                    render();
                }
            });

            scope.$on("$destroy", cleanup());
        }
    };
});

var ComponentDetailsGrid = (function (_React$Component) {
    function ComponentDetailsGrid(props) {
        _classCallCheck(this, ComponentDetailsGrid);

        _get(Object.getPrototypeOf(ComponentDetailsGrid.prototype), "constructor", this).call(this, props);
    }

    _inherits(ComponentDetailsGrid, _React$Component);

    _createClass(ComponentDetailsGrid, {
        render: {
            value: function render() {

                var className = "component-details-grid",
                    icon;

                if (this.props.details.icon) {

                    icon = React.createElement(
                        "div",
                        { className: "component-icon-container" },
                        React.createElement("img", { className: "component-icon", src: this.props.details.icon })
                    );
                }

                return React.createElement(
                    "div",
                    { className: className },
                    React.createElement(PropertyTable, { properties: this.props.properties }),
                    icon,
                    React.createElement(ConnectorsDescription, { connectors: this.props.details.connectors })
                );
            }
        }
    });

    return ComponentDetailsGrid;
})(React.Component);

},{"../../../subcircuitBrowser/directives/subcircuitDetails/ConnectorsDescription.jsx":21,"../propertyTable/propertyTable.jsx":16}],8:[function(require,module,exports){
"use strict";

require("../../services/componentLibrary.js");
require("../downloadButton/downloadButton.js");
require("../../../componentBrowser/directives/showMoreButton/showMoreButton.js");
require("../../../componentBrowser/directives/showLessButton/showLessButton.js");
require("../infoButton/infoButton.js");
require("../componentDetails/componentDetails.jsx");

var listViewBase = require("../../../common/listViewBase.js");

angular.module("mms.componentBrowser.componentListView", ["isis.ui.itemList", "mms.componentBrowser.componentLibrary", "mms.componentBrowser.downloadButton", "mms.componentBrowser.showMoreButton", "mms.componentBrowser.showLessButton", "mms.componentBrowser.infoButton", "mms.componentDetails.react"]).controller("ComponentListViewItemController", function () {}).directive("componentListView", function () {

    function ComponentDetailsController($scope) {

        var commonList = listViewBase.call(this, $scope, this.contentLibraryService);

        var config = commonList.config,
            self,
            findOctopart,
            renderList;

        self = this;

        this.listData = {
            items: []
        };

        if (typeof this.onItemDragStart === "function" && typeof this.onItemDragEnd === "function") {

            config.onItemDragStart = function (e, item) {
                self.onItemDragStart(e, item);
            };

            config.onItemDragEnd = function (e, item) {
                self.onItemDragEnd(e, item);
            };
        }

        this.config = config;

        findOctopart = function (comp) {
            var oprops;
            var i, prop;
            if (comp.componentProperties === undefined) {
                oprops = comp.otherProperties;
                if (Array.isArray(oprops)) {
                    for (i in oprops) {
                        prop = oprops[i];
                        if (prop.name !== undefined && prop.name.toLowerCase().indexOf("octopart") === 0) {
                            return prop.value;
                        }
                    }
                }
            } else {
                oprops = comp.componentProperties;
                if (Array.isArray(oprops)) {
                    for (i in oprops) {
                        prop = oprops[i];
                        if (prop.name !== undefined && prop.name.toLowerCase().indexOf("octopart") === 0) {
                            return prop.stringValue;
                        }
                    }
                }
            }
            return undefined;
        };

        renderList = function () {

            var comps = [];

            for (var i in self.components) {
                var comp = self.components[i],
                    item = commonList.itemGenerator(comp, "component", "/componentBrowser/templates/");

                item.octopart = findOctopart(comp);
                item.expandDetails = self.expandDetails;

                comps.push(item);
            }
            self.listData.items = comps;
        };

        $scope.$watchCollection(function () {
            return self.components;
        }, function () {
            renderList();
        });

        renderList();

        this.expandDetails = function (item) {

            self.contentLibraryService.getDetails(item.id, item.details).then(function (documentation) {

                item.details.documentation = documentation;
                item.expandedDetails = true;
            });
        };
    }

    return {
        restrict: "E",
        replace: true,
        controller: ComponentDetailsController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/componentListView.html",
        scope: {
            components: "=",
            onItemDragStart: "=",
            onItemDragEnd: "=",
            noDownload: "=",
            contentLibraryService: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/16/15.
 */

/*global angular*/

// console.log($scope);
//debugger;

},{"../../../common/listViewBase.js":2,"../../../componentBrowser/directives/showLessButton/showLessButton.js":17,"../../../componentBrowser/directives/showMoreButton/showMoreButton.js":18,"../../services/componentLibrary.js":20,"../componentDetails/componentDetails.jsx":7,"../downloadButton/downloadButton.js":12,"../infoButton/infoButton.js":14}],9:[function(require,module,exports){
"use strict";

require("../componentListView/componentListView.js");
require("../gridView/gridView.js");
require("../countDisplay/countDisplay.js");
require("../viewSelection/viewSelection.js");
require("../paging/paging.js");
require("../../services/componentLibrary.js");

angular.module("mms.componentBrowser.componentListing", ["mms.componentBrowser.componentListView", "mms.componentBrowser.gridView", "mms.componentBrowser.viewSelection", "mms.componentBrowser.countDisplay", "mms.componentBrowser.paging", "mms.componentBrowser.componentLibrary"]).directive("componentListing", function (componentLibrary) {

    function ComponentListingController() {

        var self = this;

        this.contentLibraryService = componentLibrary;

        this.onViewSelection = function (view) {

            if (typeof self.onListingViewSelection === "function") {
                self.onListingViewSelection({
                    view: view
                });
            }
        };
    }

    return {
        restrict: "E",
        controller: ComponentListingController,
        controllerAs: "ctrl",
        bindToController: true,
        scope: {
            componentsToList: "=",
            pagingParameters: "=",
            getNextPage: "=",
            getPrevPage: "=",
            selectedCategory: "=",
            searchText: "=",
            columnSearchText: "=",
            columnSortInfo: "=",
            newData: "=",
            facetedSearch: "=",
            setFacetedSearch: "=",
            lockGridColumns: "=",
            selectedView: "=",
            onListingViewSelection: "&",
            onItemDragStart: "=",
            onItemDragEnd: "=",
            noDownload: "=",
            setItemsPerPage: "=",
            resultsForSearchText: "=",
            appBooting: "="
        },
        replace: true,
        templateUrl: "/componentBrowser/templates/componentListing.html"
    };
});
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

},{"../../services/componentLibrary.js":20,"../componentListView/componentListView.js":8,"../countDisplay/countDisplay.js":11,"../gridView/gridView.js":13,"../paging/paging.js":15,"../viewSelection/viewSelection.js":19}],10:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.componentSearch", []).directive("componentSearch", function () {

    function ComponentSearchController() {

        var self;

        self = this;

        this.keydownInSearchField = function ($event) {

            if ($event.keyCode === 13) {
                self.doSearch();
            }
        };
    }

    return {
        restrict: "E",
        replace: true,
        controller: ComponentSearchController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/componentSearch.html",
        scope: {
            searchText: "=",
            doSearch: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

},{}],11:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.countDisplay", []).directive("countDisplay", function () {

    function CountDisplayController($scope) {
        //            this.numeral = numeral;
        $scope.numeral = numeral;

        this.getItemsPerPage = function () {
            return self.itemsPerPage;
        };

        this.availableItemsPerPage = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    }

    return {
        restrict: "E",
        controller: CountDisplayController,
        controllerAs: "ctrl",
        bindToController: true,
        scope: {
            fromNumber: "=",
            toNumber: "=",
            totalCount: "=",
            itemsPerPage: "=",
            setItemsPerPage: "="
        },
        replace: true,
        templateUrl: "/componentBrowser/templates/countDisplay.html"
    };
});
/*global angular, alert, numeral*/

},{}],12:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.downloadButton", []).directive("downloadButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/downloadButton.html"
    };
});

/*global angular*/

},{}],13:[function(require,module,exports){
"use strict";

require("../../services/componentLibrary.js");
require("../downloadButton/downloadButton.js");
require("../infoButton/infoButton.js");

angular.module("mms.componentBrowser.gridView", ["ui.grid", "ui.grid.resizeColumns", "mms.componentBrowser.componentLibrary", "mms.componentBrowser.downloadButton", "mms.componentBrowser.infoButton"]).directive("gridRow", function () {
    return {
        template: "<div class=\"grid-row\"><ng-transclude></ng-transclude></div>",
        transclude: true,
        replace: true,
        link: function link(scope, element) {

            var onDragStart,
                onDragEnd,
                itemId = scope.row.entity.id;

            //console.log(scope.row);

            onDragStart = function (e) {

                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text", itemId);

                element.addClass("dragged");

                if (typeof scope.grid.appScope.onItemDragStart === "function") {
                    scope.grid.appScope.onItemDragStart(e, scope.row.entity);
                }
            };

            onDragEnd = function (e) {

                element.removeClass("dragged");

                if (typeof scope.grid.appScope.onItemDragEnd === "function") {
                    scope.grid.appScope.onItemDragEnd(e, scope.row.entity);
                }
            };

            if (typeof scope.grid.appScope.onItemDragEnd === "function" && typeof scope.grid.appScope.onItemDragStart === "function") {

                element[0].classList.add("draggable");
                element[0].setAttribute("draggable", "true");

                element[0].addEventListener("dragstart", onDragStart);
                element[0].addEventListener("dragend", onDragEnd);
            }

            scope.$on("$destroy", function () {

                element[0].removeEventListener("dragstart", onDragStart);
                element[0].removeEventListener("dragend", onDragEnd);
            });
        }
    };
}).directive("gridView", function () {

    function ComponentGridController($scope, $log, componentLibrary) {

        var self = this;

        var addProperties = function addProperties(e, props, oprops, columnDefs) {
            //  add non-prominent properties
            if (oprops !== undefined && oprops !== null) {
                if (props === undefined || props === null) {
                    props = oprops;
                } else {
                    props = props.concat(oprops);
                }
            }
            for (var i in props) {
                var p = props[i];
                if (p.name !== "ComponentName") {
                    var val = "";
                    for (var ii in p) {
                        if (ii !== "name" && ii !== "id") {
                            var v = p[ii];
                            if (val !== "") {
                                val += " ";
                            }
                            val += v;
                        }
                    }
                    e[p.name] = val;
                    columnDefs[p.name] = null; // create a placeholder for a unique name
                }
            }
            return columnDefs;
        };

        var addSearchProperties = function addSearchProperties(e, props, columnDefs) {
            var val;
            var build = function build(x) {
                if (x !== undefined && x != null && x !== "") {
                    if (val !== "") {
                        val += " ";
                    }
                    val += x;
                }
            };
            for (var i in props) {
                var p = props[i];
                val = "";
                build(p.stringValue);
                build(p.units);
                if (p.name !== "ComponentName") {
                    e[p.name] = val;
                    columnDefs[p.name] = null; // create a placeholder for a unique name
                }
            }
            return columnDefs;
        };

        var findOctopart = function findOctopart(comp) {
            var oprops;
            var i, prop;
            if (comp.componentProperties === undefined) {
                oprops = comp.otherProperties;
                if (Array.isArray(oprops)) {
                    for (i in oprops) {
                        prop = oprops[i];
                        if (prop.name !== undefined && prop.name.toLowerCase().indexOf("octopart") === 0) {
                            return prop.value;
                        }
                    }
                }
            } else {
                oprops = comp.componentProperties;
                if (Array.isArray(oprops)) {
                    for (i in oprops) {
                        prop = oprops[i];
                        if (prop.name !== undefined && prop.name.toLowerCase().indexOf("octopart") === 0) {
                            return prop.stringValue;
                        }
                    }
                }
            }
            return undefined;
        };

        var cellTemplate, cellWidth;

        if (!this.noDownload) {

            cellTemplate = "<div class=\"text-center\"><download-button ng-click=\"grid.appScope.clickHandler(row)\"></download-button>" + "<info-button ng-if=\"row.entity.octopart!==undefined\" label=\"'View on Octopart'\" ng-click=\"grid.appScope.infoHandler(row)\"></info-button></div>";
            cellWidth = 70;
        } else {

            cellTemplate = "<info-button ng-if=\"row.entity.octopart!==undefined\" label=\"'View on Octopart'\" ng-click=\"grid.appScope.infoHandler(row)\"></info-button></div>";
            cellWidth = 30;
        }

        var renderList = function renderList() {
            var grid = [];
            var columnDefs = { name: null };
            var fnames = [{
                name: " ",
                cellTemplate: cellTemplate,
                width: cellWidth,
                enableSorting: false,
                enableColumnResizing: false,
                enableFiltering: false,
                cellClass: "actions"
            }];
            var startsWith = function startsWith(s1, s2) {
                return s1.indexOf(s2) === 0;
            };
            var findColumnIndex = function findColumnIndex(fn, name, exact) {
                var i, fldname;
                for (i = 0; i < fn.length; i++) {
                    if (fn[i] !== undefined) {
                        fldname = fn[i].field.toLowerCase();
                        if (fldname === name || !exact && startsWith(fldname, name)) {
                            return i;
                        }
                    }
                }
                return -1;
            };
            var addColumn = function addColumn(colArray, fn, exact, name) {
                var i = findColumnIndex(fn, name, exact);
                if (i !== -1) {
                    colArray.push(fn[i]);
                    delete fn[i];
                }
            };
            var sortColumns = function sortColumns(fn) {
                var res = [],
                    i;

                res.push(fn.shift());

                addColumn(res, fn, false, "name");
                addColumn(res, fn, false, "octo");
                addColumn(res, fn, false, "resistance");
                addColumn(res, fn, false, "inductance");
                addColumn(res, fn, false, "capac");
                addColumn(res, fn, true, "c");
                addColumn(res, fn, true, "r");

                // add the remaining columns
                for (i = 0; i < fn.length; i++) {
                    if (fn[i] !== undefined) {
                        res.push(fn[i]);
                    }
                }

                return res;
            };
            for (var ii in self.components) {
                var c = self.components[ii];
                var e = {};
                e.name = c.name.replace(/_/g, " ");
                e.id = c.id;
                e.octopart = findOctopart(c);
                if (c.componentProperties === undefined) {
                    columnDefs = addProperties(e, c.prominentProperties, c.otherProperties, columnDefs);
                } else {
                    columnDefs = addSearchProperties(e, c.componentProperties, columnDefs);
                }
                grid.push(e);
            }
            if (!self.lockGridColumns) {
                self.columnSearchText = {};
            }
            for (var n in columnDefs) {
                var colInfo;
                colInfo = {};
                colInfo.field = n;

                if (self.columnSearchText[n] !== undefined) {
                    colInfo.filter = { term: self.columnSearchText[n] };
                }
                //if (self.columnSortInfo[n] !== undefined) {
                //    colInfo.sort = {direction: self.columnSortInfo[n]};
                //}
                fnames.push(colInfo);
            }
            if (!self.lockGridColumns) {
                self.gridOptions.columnDefs = sortColumns(fnames);
            }
            self.gridOptions.data = grid;
            // TODO when the Angular team updates ui-grid
            //                 self.gridOptions.appScopeProvider = self;
        };

        var columnType = function columnType(rows, colName) {
            var i, val;
            for (i in rows) {
                val = rows[i].entity[colName];
                if (val.length > 0 && isNaN(parseInt(val.substr(0, 1)))) {
                    return "string";
                }
            }
            return "numeric";
        };

        self.gridOptions = {
            enableFiltering: true,
            useExternalFiltering: true,
            useExternalSorting: true,
            rowTemplate: "<grid-row>" + "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\"  ui-grid-cell></div>" + "</grid-row>",
            columnDefs: [],
            onRegisterApi: function onRegisterApi(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.core.on.sortChanged($scope, function (grid, sortCols) {
                    var i, col, dat;
                    self.columnSortInfo = [];
                    for (i in sortCols) {
                        col = sortCols[i];
                        dat = {};
                        dat.field = col.field;
                        dat.sort = col.sort.direction;
                        dat.type = columnType(this.grid.rows, col.field);
                        self.columnSortInfo.push(dat);
                    }
                    self.lockGridColumns = self.columnSortInfo.length > 0 || Object.keys(self.columnSearchText).length > 0;
                    componentLibrary.searchComponents(self.selectedCategory.path, self.searchText, self.pagingParameters.itemsPerPage, 0, self.columnSearchText, self.columnSortInfo).then(function (results) {
                        self.facetedSearch = self.columnSearchText;
                        self.setFacetedSearch(self.columnSearchText);
                        self.newData(results);
                    })["catch"](function (e) {
                        $log.warn("No results:", e);
                    });
                });
                $scope.gridApi.core.on.filterChanged($scope, function () {
                    var grid = this.grid;
                    var filt, col;
                    var n;

                    self.columnSearchText = {};
                    for (n in grid.columns) {
                        col = grid.columns[n];
                        filt = col.filters;
                        if (filt.length > 0 && filt[0].term !== undefined && filt[0].term !== null && filt[0].term.length > 0) {
                            self.columnSearchText[col.name] = filt[0].term;
                        }
                    }
                    self.lockGridColumns = self.columnSortInfo.length > 0 || Object.keys(self.columnSearchText).length > 0;
                    // cols has the search string
                    var st = self.searchText;
                    componentLibrary.searchComponents(self.selectedCategory.path, st, self.pagingParameters.itemsPerPage, 0, self.columnSearchText, self.columnSortInfo).then(function (results) {
                        self.facetedSearch = self.columnSearchText;
                        self.setFacetedSearch(self.columnSearchText);
                        self.newData(results);
                    })["catch"](function (e) {
                        $log.warn("No results:", e);
                    });
                });
            }
        };

        $scope.onItemDragStart = this.onItemDragStart;
        $scope.onItemDragEnd = this.onItemDragEnd;

        $scope.clickHandler = function (row) {
            componentLibrary.downloadItem(row.entity.id);
        };

        $scope.infoHandler = function (row) {
            if (row.entity.octopart !== undefined) {
                var url = "http://octopart.com/search?q=" + row.entity.octopart + "&view=list";
                var win = window.open(url, "_blank");
                win.focus();
            }
        };

        $scope.$watch(function () {
            return self.components;
        }, function () {
            renderList();
        });

        //            renderList();
    }

    return {
        restrict: "E",
        replace: true,
        controller: ComponentGridController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/gridView.html",
        scope: {
            components: "=",
            selectedCategory: "=",
            searchText: "=",
            columnSearchText: "=",
            columnSortInfo: "=",
            pagingParameters: "=",
            newData: "=",
            facetedSearch: "=",
            setFacetedSearch: "=",
            lockGridColumns: "=",
            onItemDragStart: "=",
            onItemDragEnd: "=",
            noDownload: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/26/15.
 */

/*global angular*/

},{"../../services/componentLibrary.js":20,"../downloadButton/downloadButton.js":12,"../infoButton/infoButton.js":14}],14:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.infoButton", []).directive("infoButton", function () {

    return {
        scope: {
            label: "="
        },
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/infoButton.html"
    };
});
/**
 * Created by Blake McBride on 3/27/15.
 */

/*global angular*/

},{}],15:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.paging", []).directive("paging", function () {

    function PagingController() {

        var self;

        self = this;

        this.nextPage = function () {
            if (angular.isFunction(self.onNextPage)) {
                self.onNextPage();
            }
        };

        this.prevPage = function () {
            if (angular.isFunction(self.onPrevPage)) {
                self.onPrevPage();
            }
        };

        this.canNextPage = function () {

            var result = false;

            if (self.config && self.config.toNumber < self.config.totalCount) {
                result = true;
            }

            return result;
        };

        this.canPrevPage = function () {

            var result = false;

            if (self.config && self.config.fromNumber - self.config.itemsPerPage > 0) {
                result = true;
            }

            return result;
        };
    }

    return {

        restrict: "E",
        replace: false,
        controller: PagingController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/paging.html",
        scope: {
            config: "=",
            onPrevPage: "=",
            onNextPage: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/24/15.
 */

/*global angular*/

},{}],16:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var PropertyTable = (function (_React$Component) {
    function PropertyTable() {
        _classCallCheck(this, PropertyTable);

        if (_React$Component != null) {
            _React$Component.apply(this, arguments);
        }
    }

    _inherits(PropertyTable, _React$Component);

    _createClass(PropertyTable, {
        render: {
            value: function render() {

                this.items = this.props.properties.map(function (item, index) {

                    return React.createElement(PropertyTableItem, { property: item, ref: index, key: index });
                });

                return React.createElement(
                    "div",
                    { className: "property-table" },
                    this.items
                );
            }
        },
        componentDidMount: {
            value: function componentDidMount() {

                var nameWidths = [],
                    valueWidths = [];

                for (var i in this.refs) {

                    // let itemEl = React.findDOMNode(this.refs[i]);
                    //
                    // itemEls.push(itemEl);

                    var item = this.refs[i];

                    nameWidths.push(item.getNameWidth());
                    valueWidths.push(item.getValueWidth());
                }

                var widestNameWidth = Math.max.apply(null, nameWidths);
                var widestValueWidth = Math.max.apply(null, valueWidths);

                //let itemWidth = widestNameWidth + widestValueWidth;

                for (var i in this.refs) {

                    var item = this.refs[i];

                    item.setNameWidth(widestNameWidth);
                    item.setValueWidth(widestValueWidth);
                }
            }
        }
    });

    return PropertyTable;
})(React.Component);

var PropertyTableItem = (function (_React$Component2) {
    function PropertyTableItem() {
        _classCallCheck(this, PropertyTableItem);

        if (_React$Component2 != null) {
            _React$Component2.apply(this, arguments);
        }
    }

    _inherits(PropertyTableItem, _React$Component2);

    _createClass(PropertyTableItem, {
        render: {
            value: function render() {

                var nameEl = React.createElement(
                    "div",
                    { className: "property-name", title: this.props.property.name, ref: "name" },
                    this.props.property.name
                );

                var valueEl = React.createElement(
                    "div",
                    { className: "property-value", title: this.props.property.value, ref: "value" },
                    this.props.property.value
                );

                return React.createElement(
                    "div",
                    { className: "property-table-item" },
                    nameEl,
                    valueEl
                );
            }
        },
        getNameWidth: {
            value: function getNameWidth() {

                return Math.ceil(parseFloat(getComputedStyle(React.findDOMNode(this.refs.name)).width));
            }
        },
        getValueWidth: {
            value: function getValueWidth() {

                return Math.ceil(parseFloat(getComputedStyle(React.findDOMNode(this.refs.value)).width));
            }
        },
        setNameWidth: {
            value: function setNameWidth(w) {
                React.findDOMNode(this.refs.name).style.width = w + "px";
            }
        },
        setValueWidth: {
            value: function setValueWidth(w) {
                React.findDOMNode(this.refs.value).style.width = w + "px";
            }
        },
        setWidth: {
            value: function setWidth(w) {
                React.findDOMNode(this).style.width = w + "px";
            }
        }
    });

    return PropertyTableItem;
})(React.Component);

module.exports = PropertyTable;

},{}],17:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.showLessButton", []).directive("showLessButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/showLessButton.html"
    };
});
/*global angular*/

},{}],18:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.showMoreButton", []).directive("showMoreButton", function () {

    return {
        restrict: "E",
        replace: true,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/showMoreButton.html"
    };
});
/*global angular*/

},{}],19:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.viewSelection", []).directive("viewSelection", function () {

    function ViewSelectionController() {

        var self = this;

        this.selectView = function (view) {

            self.selectedView = view;

            if (typeof self.onViewSelection === "function") {
                self.onViewSelection({
                    view: view
                });
            }
        };
    }

    return {
        restrict: "E",
        scope: {
            selectedView: "=",
            onViewSelection: "&"
        },
        replace: true,
        controller: ViewSelectionController,
        bindToController: true,
        controllerAs: "ctrl",
        templateUrl: "/componentBrowser/templates/viewSelection.html"
    };
});
/**
 * Created by Blake McBride on 2/26/15.
 */

/*global angular*/

},{}],20:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.componentLibrary", []).provider("componentLibrary", function ComponentLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var ComponentLibrary, encodeCategoryPath;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        ComponentLibrary = function () {

            var classificationTree, subcircuitTree, grandTotal, subcircuitGrandTotal;

            this.getServerUrl = function () {
                return serverUrl;
            };

            this.getListOfComponents = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                /*  Approach changed from getting all components in a category to getting all components in
                    the current category and all categories below.
                 */

                //url = serverUrl + '/components/list/' + encodeCategoryPath(categoryPath) +
                //    '/' + itemCount + '/' + cursor;
                //
                //$http.get(url)
                //
                //    .success(function (data) {
                //        deferred.resolve(data.components);
                //    })
                //    .error(function (e) {    // assume attempt to page past available components
                //        deferred.reject('Could not load list of components', e);
                //});

                $http.get(serverUrl + "/components/search" + "/" + encodeCategoryPath(categoryPath) + "/" + "_all" + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getListOfSubCircuits = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                $http.get(serverUrl + "/subcircuit/list/" + encodeCategoryPath(categoryPath) + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data.subcircuits);
                }).error(function (e) {
                    // assume attempt to page past available components
                    deferred.reject("Could not load list of sub-circuits", e);
                });

                return deferred.promise;
            };

            this.getClassificationTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    classificationTree = data.classes;
                    deferred.resolve(classificationTree);
                    grandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load component classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            this.getSubCircuitTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/subcircuit/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    subcircuitTree = data.classes;
                    deferred.resolve(subcircuitTree);
                    subcircuitGrandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load sub-circuit classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            var downloadURL = function downloadURL(url) {
                var hiddenIFrameID = "hiddenDownloader",
                    iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement("iframe");
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
            };

            this.downloadItem = function (id) {

                $log.debug("Download handler");

                // console.log(serverUrl);

                window.location = serverUrl + "/getcomponent/download/" + id;
            };

            // TODO: cleanup subcircuit stuff

            this.downloadSubcircuit = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/subcircuit/getsubcircuit/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getGrandTotal = function () {
                return grandTotal;
            };

            this.getSubcircuitGrandTotal = function () {
                return subcircuitGrandTotal;
            };

            this.searchComponents = function (categoryPath, globalSearchText, itemCount, cursor, columnSearchText, sortColumns) {

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                sortColumns = sortColumns === undefined || sortColumns === null ? [] : sortColumns;

                var parameters = {};
                parameters.columnSearchText = columnSearchText;
                parameters.sortColumns = sortColumns;

                $http({
                    url: serverUrl + "/components/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET",
                    params: parameters
                }).success(function (data) {

                    if (data && angular.isArray(data.component) && data.component.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.component = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.searchSubCircuits = function (categoryPath, globalSearchText, itemCount, cursor) {

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                $http({
                    url: serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET"
                }).success(function (data) {

                    if (data && angular.isArray(data.subcircuit) && data.subcircuit.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.subcircuit = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getDetails = function (id) {

                var path = serverUrl + "/components/overview/" + id,
                    deferred = $q.defer();

                $http.get(path).then(function (json) {

                    var documentation = {
                        id: id,
                        description: json.data.description,
                        connectors: json.data.connectors
                    };

                    if (json.data.iconFileName) {
                        documentation.icon = "/component_files/" + json.data.iconFileName;
                    }

                    deferred.resolve(documentation);
                });

                return deferred.promise;
            };
        };

        return new ComponentLibrary();
    }];
});
/*globals angular*/

},{}],21:[function(require,module,exports){
"use strict";

var ConnectorsDescription = React.createClass({
    displayName: "ConnectorsDescription",

    render: function render() {

        var title, connectors;

        if (Array.isArray(this.props.connectors)) {

            this.props.connectors.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name === b.name) {
                    return 0;
                } else if (a.name > b.name) {
                    return 1;
                }
            });

            title = React.createElement(
                "h3",
                null,
                "Connectors:"
            );

            connectors = Array.isArray(this.props.connectors) && this.props.connectors.map(function (connectorDescription) {
                return React.createElement(ConnectorDescription, { connector: connectorDescription });
            });
        }

        return React.createElement(
            "div",
            { className: "connectors-description" },
            title,
            connectors
        );
    }
});

var ConnectorDescription = React.createClass({
    displayName: "ConnectorDescription",

    render: function render() {

        var connectorDetails = [],
            cssClass = "connector-description",
            name = this.props.connector.name.replace("_", " ");

        connectorDetails.push(React.createElement(
            "div",
            { className: "connector-name" },
            name
        ));

        if (this.props.connector.type) {

            connectorDetails.push(React.createElement(
                "div",
                { className: "connector-type" },
                this.props.connector.type
            ));
            cssClass += " " + this.props.connector.type;
        }

        if (this.props.connector.description) {
            connectorDetails.push(React.createElement(
                "div",
                { className: "connector-description-text" },
                this.props.connector.description
            ));
        }

        return React.createElement(
            "div",
            { className: cssClass },
            connectorDetails
        );
    }
});

module.exports = ConnectorsDescription;

},{}],22:[function(require,module,exports){
"use strict";

angular.module("mms.subcircuitBrowser.subcircuitLibrary", []).provider("subcircuitLibrary", function SubcircuitLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var SubcircuitLibrary, encodeCategoryPath;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        SubcircuitLibrary = function () {

            var subcircuitTree, subcircuitGrandTotal;

            this.getServerUrl = function () {
                return serverUrl;
            };

            this.getListOfSubCircuits = function (categoryPath, itemCount, cursor) {

                var deferred = $q.defer();

                $http.get(serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + "_all" + "/" + itemCount + "/" + cursor).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    // assume attempt to page past available components
                    deferred.reject("Could not load list of sub-circuits", e);
                });

                return deferred.promise;
            };

            this.getSubCircuitTree = function (id) {

                var deferred = $q.defer(),
                    url;

                url = serverUrl + "/subcircuit/classification/tree";

                if (angular.isString(id)) {
                    url += "/" + encodeCategoryPath(id);
                }

                $http.get(url).success(function (data) {

                    subcircuitTree = data.classes;
                    deferred.resolve(subcircuitTree);
                    subcircuitGrandTotal = data.grandTotal;
                }).error(function (data, status, headers, config) {
                    deferred.reject({
                        msg: "Could not load sub-circuit classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            var downloadURL = function downloadURL(url) {
                var hiddenIFrameID = "hiddenDownloader",
                    iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement("iframe");
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
            };

            this.downloadItem = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/subcircuit/getsubcircuit/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getSubcircuitGrandTotal = function () {
                return subcircuitGrandTotal;
            };

            this.searchSubCircuits = function (categoryPath, globalSearchText, itemCount, cursor) {

                // console.log(serverUrl + '/subcircuit/search' + '/' + encodeCategoryPath(categoryPath) + '/' + globalSearchText + '/' + itemCount + '/' + cursor);

                var deferred = $q.defer();

                globalSearchText = globalSearchText === undefined || globalSearchText === null || globalSearchText === "" ? "_all" : globalSearchText;

                // console.log(globalSearchText);

                $http({
                    url: serverUrl + "/subcircuit/search" + "/" + encodeCategoryPath(categoryPath) + "/" + globalSearchText + "/" + itemCount + "/" + cursor,
                    method: "GET"
                }).success(function (data) {

                    if (data && angular.isArray(data.subcircuit) && data.subcircuit.length) {
                        deferred.resolve(data);
                    } else {
                        data = {};
                        data.subcircuit = []; //  no data
                        deferred.resolve(data);
                    }
                }).error(function (e) {
                    deferred.reject("Could not perform search", e);
                });

                return deferred.promise;
            };

            this.getDetails = function (id) {

                var path = serverUrl + "/subcircuit/overview/" + id,
                    deferred = $q.defer();

                $http.get(path).then(function (json) {

                    var documentation = {
                        id: id,
                        description: json.data.description,
                        connectors: json.data.connectors,
                        visuals: json.data.visuals,
                        icon: json.data.icon
                    };

                    deferred.resolve(documentation);
                });

                return deferred.promise;
            };
        };

        return new SubcircuitLibrary();
    }];
});
/*globals angular*/

},{}]},{},[1])


//# sourceMappingURL=componentBrowser.js.map