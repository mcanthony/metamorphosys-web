(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

require("./directives/componentBrowser/componentBrowser");
require("./services/componentLibrary.js");
require("./appConfig");

angular.module("mms.componentBrowserApp", ["mms.componentBrowser", "mms.componentBrowser.config", "mms.componentBrowser.componentLibrary"]).config(function (componentLibraryProvider, componentServerUrl) {
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

},{"./appConfig":2,"./directives/componentBrowser/componentBrowser":3,"./services/componentLibrary.js":14}],2:[function(require,module,exports){
"use strict";

/*globals angular*/
angular.module("mms.componentBrowser.config", []).constant("componentServerUrl", "http://localhost:3000");

},{}],3:[function(require,module,exports){
"use strict";

require("../componentCategories/componentCategories.js");
require("../componentSearch/componentSearch.js");
require("../componentListing/componentListing.js");
require("../../services/componentLibrary.js");

angular.module("mms.componentBrowser", ["mms.componentBrowser.templates", "mms.componentBrowser.componentCategories", "mms.componentBrowser.componentSearch", "mms.componentBrowser.componentListing", "mms.componentBrowser.componentLibrary", "ngCookies"]).directive("componentBrowser", function () {

    function ComponentBrowserController($scope, componentLibrary, $log, $anchorScroll, $timeout, $cookies, $location) {

        var self, updateList, noSearchResults, loadState;

        self = this;

        this.showHeader = false;

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

        this.getNextPage = function () {

            var nextCursor;

            console.log("next");

            nextCursor = self.pagingParameters.cursor + self.pagingParameters.itemsPerPage;

            if (nextCursor < self.pagingParameters.totalCount) {

                self.pagingParameters.cursor = nextCursor;
                updateList();
            }

            self.saveState();
        };

        this.getPrevPage = function () {

            console.log("prev");

            self.pagingParameters.cursor = Math.max(self.pagingParameters.cursor - self.pagingParameters.itemsPerPage, 0);

            updateList();

            self.saveState();
        };

        this.newData = function (results) {
            console.log("Search results", results);
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

                        console.log("Search results", results);
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

            if (attributes.hasOwnProperty("noHeader")) {
                ctrl.showHeader = false;
            } else {
                ctrl.showHeader = true;
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

            ctrl.init();
        }
    };
});
/*global angular*/

},{"../../services/componentLibrary.js":14,"../componentCategories/componentCategories.js":4,"../componentListing/componentListing.js":5,"../componentSearch/componentSearch.js":6}],4:[function(require,module,exports){
"use strict";

/*global numeral*/

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
                dlbl,
                children = [];

            if (e !== undefined && e.categoryTotal !== undefined) {
                dlbl = lbl + " (" + numeral(e.categoryTotal).format("0,0") + ")";
            } else {
                dlbl = lbl;
            }

            // node structure
            newTreeNode = {
                id: id,
                label: dlbl,
                extraInfo: "",
                children: children,
                childrenCount: e === undefined ? 0 : e.childCategoriesCount,
                nodeData: {
                    label: lbl,
                    path: e === undefined ? "" : e.id,
                    childComponentsCount: e === undefined ? 0 : e.childComponentsCount
                },
                iconClass: null,

                draggable: false,
                //dragChannel: 'a',
                //dropChannel: ( Math.random() > 0.5 ) ? 'a' : 'b',
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
                console.log("loadChildren called:", node);
                var deferred = $q.defer();

                componentLibrary.getClassificationTree(node.nodeData.path).then(function (data) {

                    var children;

                    children = addData(node, data);
                    deferred.resolve(children);
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

            //nodeContextmenuRenderer: function ( e, node ) {
            //    console.log( 'Contextmenu was triggered for node:', node );
            //
            //    return getNodeContextmenu( node );
            //
            //},

            nodeExpanderClick: function nodeExpanderClick(e, node, isExpand) {
                console.log("Expander was clicked for node:", node, isExpand);
            }

        };

        self.config = config;
        //self.config.disableManualSelection = true;
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
        componentLibrary.getClassificationTree().then(function (data) {
            addData(self.treeData, data);
        });
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
            lockGridColumns: "="
        }
    };
});
/*global angular*/

/**
 * Created by Blake McBride on 2/9/15.
 */

},{"../../services/componentLibrary.js":14}],5:[function(require,module,exports){
"use strict";

require("../listView/listView.js");
require("../gridView/gridView.js");
require("../countDisplay/countDisplay.js");
require("../viewSelection/viewSelection.js");
require("../paging/paging.js");
require("../../services/componentLibrary.js");

angular.module("mms.componentBrowser.componentListing", ["mms.componentBrowser.listView", "mms.componentBrowser.gridView", "mms.componentBrowser.viewSelection", "mms.componentBrowser.countDisplay", "mms.componentBrowser.paging", "mms.componentBrowser.componentLibrary"]).directive("componentListing", function () {

    function ComponentListingController() {

        var self = this;

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
            onItemDragEnd: "="

        },
        replace: true,
        templateUrl: "/componentBrowser/templates/componentListing.html"
    };
});
/**
 * Created by Blake McBride on 2/23/15.
 */

/*global angular, alert*/

},{"../../services/componentLibrary.js":14,"../countDisplay/countDisplay.js":7,"../gridView/gridView.js":9,"../listView/listView.js":11,"../paging/paging.js":12,"../viewSelection/viewSelection.js":13}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.countDisplay", []).directive("countDisplay", function () {

    function CountDisplayController($scope) {
        //            this.numeral = numeral;
        $scope.numeral = numeral;
    }

    return {
        restrict: "E",
        controller: CountDisplayController,
        controllerAs: "ctrl",
        bindToController: true,
        scope: {
            fromNumber: "=",
            toNumber: "=",
            totalCount: "="
        },
        replace: true,
        templateUrl: "/componentBrowser/templates/countDisplay.html"
    };
});
/*global angular, alert, numeral*/

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

        var renderList = function renderList() {
            var grid = [];
            var columnDefs = { name: null };
            var fnames = [{
                name: " ",
                cellTemplate: "<div class=\"text-center\"><download-button ng-click=\"grid.appScope.clickHandler(row)\"></download-button><info-button ng-if=\"row.entity.octopart!==undefined\" ng-click=\"grid.appScope.infoHandler(row)\"></info-button></div>",
                width: 70,
                enableSorting: false,
                enableColumnResizing: false,
                enableFiltering: false
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
            componentLibrary.downloadComponent(row.entity.id);
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
            onItemDragEnd: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/26/15.
 */

/*global angular*/

},{"../../services/componentLibrary.js":14,"../downloadButton/downloadButton.js":8,"../infoButton/infoButton.js":10}],10:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.infoButton", []).directive("infoButton", function () {

    return {
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

},{}],11:[function(require,module,exports){
"use strict";

require("../../services/componentLibrary.js");
require("../downloadButton/downloadButton.js");
require("../infoButton/infoButton.js");

angular.module("mms.componentBrowser.listView", ["isis.ui.itemList", "mms.componentBrowser.componentLibrary", "mms.componentBrowser.downloadButton", "mms.componentBrowser.infoButton"]).controller("ListViewItemController", function ($scope) {
    console.log($scope);
    //debugger;
}).directive("listView", function () {

    function ComponentDetailsController($scope, componentLibrary) {
        var config, self, findOctopart, renderList, formatProperties, itemGenerator;

        self = this;

        config = {
            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: false,
            showDetailsLabel: "Show details",
            hideDetailsLabel: "Hide details",

            // Event handlers

            itemSort: function itemSort(jQEvent, ui) {
                console.log("Sort happened", jQEvent, ui);
            },

            itemClick: function itemClick(event, item) {
                console.log("Clicked: " + item);
            },

            itemDownload: function itemDownload(event, item) {
                componentLibrary.downloadComponent(item.id);
            },

            itemInfo: function itemInfo(event, item) {
                if (item.octopart !== undefined) {
                    var url = "http://octopart.com/search?q=" + item.octopart + "&view=list";
                    var win = window.open(url, "_blank");
                    win.focus();
                }
            },

            itemContextmenuRenderer: function itemContextmenuRenderer(e, item) {
                console.log("Contextmenu was triggered for node:", item);

                return [{
                    items: [{
                        id: "download",
                        label: "Download component",
                        disabled: false,
                        action: function action() {
                            componentLibrary.downloadComponent(item.id);
                        },
                        actionData: item,
                        iconClass: "fa fa-plus"
                    }]
                }];
            },

            detailsRenderer: function detailsRenderer(item) {
                item.details = "My details are here now!";
            }

        };

        if (typeof this.onItemDragStart === "function" && typeof this.onItemDragEnd === "function") {

            config.onItemDragStart = function (e, item) {
                self.onItemDragStart(e, item);
            };

            config.onItemDragEnd = function (e, item) {
                self.onItemDragEnd(e, item);
            };
        }

        this.listData = {
            items: []
        };

        this.config = config;

        formatProperties = function (comp) {
            var res = "";
            var pp, i, prop, key;

            var build = function build(x) {
                if (x !== undefined && x !== null && x !== "") {
                    if (res !== "") {
                        res += " ";
                    }
                    res += x;
                }
            };

            if (comp.componentProperties === undefined) {
                pp = comp.prominentProperties;
                //  add non-prominent properties
                if (comp.otherProperties !== undefined && comp.otherProperties !== null) {
                    if (pp === undefined || pp === null) {
                        pp = comp.otherProperties;
                    } else {
                        pp = pp.concat(comp.otherProperties);
                    }
                }

                if (pp !== undefined && pp !== null) {
                    for (i in pp) {
                        prop = pp[i];
                        if (prop.name !== undefined && prop.value !== undefined) {
                            if (prop.name !== "ComponentName") {
                                if (res !== "") {
                                    res += " ";
                                }
                                res += prop.name + " " + prop.value;
                                if (prop.units !== undefined) {
                                    res += " " + prop.units;
                                }
                            }
                        } else {
                            for (key in prop) {
                                if (key !== "id") {
                                    if (res !== "") {
                                        res += " ";
                                    }
                                    res += key + ": ";
                                    res += " " + prop[key];
                                }
                            }
                        }
                    }
                }
            } else {
                pp = comp.componentProperties;
                if (pp !== undefined && pp !== null) {
                    for (i in pp) {
                        prop = pp[i];
                        if (prop.name !== undefined && prop.stringValue !== undefined) {
                            if (prop.name !== "ComponentName") {
                                if (res !== "") {
                                    res += " ";
                                }
                                res += prop.name + " " + prop.stringValue;
                                if (prop.units !== undefined) {
                                    res += " " + prop.units;
                                }
                            }
                        } else {
                            build(prop.name);
                            build(prop.stringValue);
                            build(prop.units);
                        }
                    }
                }
            }
            return res;
        };

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

        itemGenerator = function (comp) {
            return {
                id: comp.id,
                octopart: findOctopart(comp),
                title: comp.name.replace(/_/g, " "),
                toolTip: "Open item",
                headerTemplateUrl: "/componentBrowser/templates/itemHeader.html",
                details: formatProperties(comp)
            };
        };

        renderList = function () {

            var comps = [];

            for (var i in self.components) {
                var comp = self.components[i];
                comps.push(itemGenerator(comp));
            }
            self.listData.items = comps;
        };

        $scope.$watchCollection(function () {
            return self.components;
        }, function () {
            renderList();
        });

        renderList();
    }

    return {
        restrict: "E",
        replace: true,
        controller: ComponentDetailsController,
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: "/componentBrowser/templates/listView.html",
        scope: {
            components: "=",
            onItemDragStart: "=",
            onItemDragEnd: "="
        }
    };
});
/**
 * Created by Blake McBride on 2/16/15.
 */

/*global angular*/

},{"../../services/componentLibrary.js":14,"../downloadButton/downloadButton.js":8,"../infoButton/infoButton.js":10}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
"use strict";

angular.module("mms.componentBrowser.componentLibrary", []).provider("componentLibrary", function ComponentLibraryProvider() {
    var serverUrl;

    this.setServerUrl = function (url) {
        serverUrl = url;
    };

    this.$get = ["$http", "$q", "$log", function ($http, $q, $log) {

        var ComponentLibrary, encodeCategoryPath, downloadURL;

        encodeCategoryPath = function (path) {
            return path.replace(/\//g, "!");
        };

        ComponentLibrary = function () {

            var classificationTree, grandTotal;

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
                        msg: "Could not load classification tree",
                        data: data,
                        status: status,
                        headers: headers,
                        config: config
                    });
                });

                return deferred.promise;
            };

            downloadURL = function (url) {
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

            this.downloadComponent = function (id) {

                $log.debug("Download handler");

                $http.get(serverUrl + "/getcomponent/f/" + id).success(function (filename) {

                    downloadURL(serverUrl + "/" + filename);
                });
            };

            this.getGrandTotal = function () {
                return grandTotal;
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
        };

        return new ComponentLibrary();
    }];
});
/*globals angular*/

},{}]},{},[1])


//# sourceMappingURL=componentBrowser.js.map