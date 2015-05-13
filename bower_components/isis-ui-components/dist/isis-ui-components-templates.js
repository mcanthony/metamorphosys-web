angular.module("isis.ui.components.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/isis-ui-components/templates/contextmenu.DefaultContents.html","<hierarchical-menu menu=\"contextmenuData\" config=\"contextmenuConfig\"></hierarchical-menu>");
$templateCache.put("/isis-ui-components/templates/contextmenu.html","<div class=\"contextmenu\" ng-class=\"menuCssClass\"><div ng-include=\"contentTemplateUrl\"></div></div>");
$templateCache.put("/isis-ui-components/templates/dropdownNavigator.html","<nav class=\"dropdown-navigator-container\">\n    <ul class=\"dropdown-navigator\">\n        <script type=\"text/ng-template\" id=\"navigator-item-template\">\n            <div class=\"label-container\" data-ng-click=\"!item.disabled && item.action(item.actionData, $event)\">\n                <span class=\"item-label\">{{item.label}}</span>\n            </div>\n            <hierarchical-menu menu=\"item.menu\"></hierarchical-menu>\n        </script>\n        <li data-ng-repeat-start=\"item in navigator.items track by $index\"\n            data-ng-class=\" item.itemClass || \'\' \"\n            ng-include=\" item.itemTemplate || \'navigator-item-template\' \"\n            role=\"button\">\n        </li>\n        <li data-ng-repeat-end data-ng-if=\"navigator.separator && !$last\" class=\"separator\">\n            <i class=\"glyphicon glyphicon-chevron-right\"></i>\n        </li>\n    </ul>\n</nav>\n");
$templateCache.put("/isis-ui-components/templates/hierarchicalMenu.html","<div class=\"hierarchical-menu\">\n    <script type=\"text/ng-template\" id=\"menu-items\">\n\n        <div data-ng-repeat-start=\"menuItemGroup in menu\" data-ng-if=\"false\"></div>\n\n            <li data-ng-if=\"!$first && menuItemGroup.items && menuItemGroup.items.length > 0\"\n                class=\"divider\"></li>\n\n            <li data-ng-if=\"menuItemGroup.label && menuItemGroup.items && menuItemGroup.items.length > 0\"\n                class=\"label\">{{menuItemGroup.label}}\n            </li>\n\n            <li\n                data-ng-repeat=\"item in menuItemGroup.items | limitTo:menuItemGroup.totalItems || 100\"\n                data-ng-class=\"{ \'dropdown-submenu\':item.menu, \'selected\': item.isSelected, \'disabled\': item.disabled || parentItem.disabled }\">\n                <a data-ng-class=\"\'action-\' + item.id\"\n                   data-ng-click=\"!(item.disabled || parentItem.disabled) && item.action(item.actionData, $event)\">\n                    <i data-ng-if=\"item.iconClass && !item.iconPullRight\" data-ng-class=\"item.iconClass\" class=\"item-icon\"></i>\n                    {{item.label}}\n                    <i data-ng-if=\"item.iconClass && item.iconPullRight\" data-ng-class=\"item.iconClass\"></i>\n                </a>\n                <ul class=\"dropdown-menu\"\n                    role=\"menu\"\n                    aria-labelledby=\"dropdownMenu\"\n                    data-ng-if=\"item.menu\"\n                    ng-include=\"\'menu-items\'\"\n                    data-ng-init=\"menu=item.menu; parentItem=item;\">\n                </ul>\n            </li>\n\n            <!--<li class=\"dot-dot-dot\" data-ng-if=\"menuItemGroup.showAllItems\">...</li>-->\n            <li class=\"show-all-items\"\n                data-ng-if=\"menuItemGroup.showAllItems &&\n                menuItemGroup.items &&\n                menuItemGroup.items.length > 0 &&\n                menuItemGroup.items.length >  ( menuItemGroup.totalItems || 100 )\">\n                <a data-ng-click=\"menuItemGroup.showAllItems()\">\n                   Show all...\n                </a>\n            </li>\n\n        <div data-ng-repeat-end data-ng-if=\"false\"></div>\n\n    </script>\n\n    <ul class=\"menu-contents\"\n        role=\"menu\"\n        data-ng-if=\"menu\"\n        ng-include=\"\'menu-items\'\">\n    </ul>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/itemDetails.html","<div class=\"item-details\" ng-class=\"{ \'expanded\': shouldBeExpanded(), \'collapsed\':!shouldBeExpanded() }\">\n    <div class=\"item-details-header\"\n         ng-click=\"detailsCollapserClick()\"\n         ng-if=\"config.detailsCollapsible\">{{::getExpanderLabel()}}<i class=\"pull-right\" ng-class=\"getExpanderClass()\"></i></div>\n    <div class=\"item-details-contents\" ng-if=\"shouldBeExpanded()\">\n        <div ng-if=\"::item.detailsTemplateUrl\" ng-include=\"::item.detailsTemplateUrl\"></div>\n        <div ng-if=\"::!item.detailsTemplateUrl\">{{item.details}}</div>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemHeader.html","<header>\n        <div ng-if=\"::item.headerTemplateUrl\" ng-include=\"::item.headerTemplateUrl\"></div>\n        <h4 ng-if=\"::!item.headerTemplateUrl\"><a class=\"item-title\"\n               ng-click=\"itemClick($event, item)\"\n               tooltip=\"{{ item.toolTip }}\"\n               tooltip-placement=\"right\">{{ item.title }}</a></h4>\n        <il-item-menu></il-item-menu>\n</header>");
$templateCache.put("/isis-ui-components/templates/itemList.html","<div class=\"item-list\">\n    <div class=\"row\" ng-if=\"config.newItemForm\">\n        <item-list-new-item\n                form-config=\"listData.config.newItemForm\"></item-list-new-item>\n    </div>\n    <div class=\"row\" ng-if=\"config.filter\">\n        <item-list-filter></item-list-filter>\n    </div>\n    <div class=\"row\">\n        <list-item-group></list-item-group>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemListFilter.html","<div class=\"item-list-filter\">\n    <div class=\"panel-group\">\n        <input class=\"form-control\" placeholder=\"Type to filter...\" ng-model=\"config.filter.$\">\n        <div class=\"filter-stats\"\n             ng-if=\"config.filter.$ && filteredItems.length\">{{filteredItems.length}} matched items</div>\n    </div>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/itemListItem.html","<li class=\"item-list-item list-group-item\"\n    isis-contextmenu\n    contextmenu=\"itemContextmenu($event, item)\"\n    contextmenu-data=\"itemContextMenuData\"\n    ng-class=\"item.cssClass\">\n    <il-item-header></il-item-header>\n    <div ng-if=\"item.description\" class=\"description\">{{ item.description }}</div>\n    <il-item-details ng-if=\"item.details || item.detailsTemplateUrl\"></il-item-details>\n    <footer>\n        <taxonomy-terms ng-if=\"item.taxonomyTerms\" class=\"tags\" terms=\"item.taxonomyTerms\"></taxonomy-terms>\n        <div ng-if=\"::item.lastUpdated\"\n            class=\"last-updated\">Updated <span am-time-ago=\"item.lastUpdated.time\"></span>\n            <span ng-if=\"::item.lastUpdated.user\"> by <a href=\"\">{{item.lastUpdated.user}}</a></span>\n        </div>\n        <il-item-stats></il-item-stats>\n    </footer>\n</li>");
$templateCache.put("/isis-ui-components/templates/itemListNewItem.html","<div class=\"create-new-item\" class=\"row\">\n\n    <div class=\"panel-group\" aria-multiselectable=\"true\">\n        <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n                <h4 class=\"panel-title\"\n                    ng-click=\"toggleNewItemFormCollapsed()\">\n                    <i class=\"glyphicon\"\n                       ng-class=\"{\'glyphicon-chevron-up\': formConfig.expanded, \'glyphicon-plus\': !formConfig.expanded}\"></i>\n                    {{formConfig.title}}\n                </h4>\n            </div>\n            <div class=\"panel-collapse collapse\"\n                 ng-class=\"{ \'in\': formConfig.expanded === true }\">\n                <div class=\"form-content panel-body\"\n                     ng-include=\"formConfig.itemTemplateUrl\"\n                     ng-controller=\"formConfig.controller\">\n                </div>\n            </div>\n        </div>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/itemMenu.html","<div class=\"item-menu pull-right\"\n     data-ng-if=\"config.secondaryItemMenu\"\n       isis-contextmenu\n       contextmenu=\"itemContextmenu($event, item)\"\n       contextmenu-data=\"itemContextMenuData\"\n       contextmenu-config=\"itemMenuConfig\">\n    <a class=\"icon-arrow-down\"></a>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/itemStats.html","<div class=\"stats\">\n    <ul class=\"list-group\">\n        <li class=\"list-group-item pull-left\"\n            ng-repeat=\"statItem in item.stats\"\n            tooltip=\"{{statItem.toolTip}}\" tooltip-placement=\"bottom\">\n            <i  ng-if=\"statItem.iconClass\"\n                ng-class=\"statItem.iconClass\"></i>\n            <span class=\"count\">{{ statItem.value }}</span></li>\n    </ul>\n</div>");
$templateCache.put("/isis-ui-components/templates/listItemGroup.html","<div class=\"list-group-wrapper\">\n    <ul class=\"list-group\" ng-show=\"filteredItems.length\">\n        <item-list-item\n            ng-repeat=\"item in filteredItems = ( listData.items | filter: config.filter ) track by $index  \">\n        </item-list-item>\n    </ul>\n    <div class=\"no-items-to-show-message\" ng-if=\"!filteredItems.length\">{{config.noItemsMessage}}</div>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGrid.html","<div class=\"property-grid\"\n     ng-class=\"{ \'unresponsive\': unresponsive }\"\n     ng-attr-id=\"gridData.id\">\n    <form>\n    <!--<script type=\"text/ng-template\" id=\"property-grid-item-template\">-->\n        <!--<div class=\"item row\">-->\n            <!--<label class=\"col-md-3\">{{ item.label }}</label>-->\n            <!--<div class=\"col-md-9\">{{ item.value }}</div>-->\n        <!--</div>-->\n    <!--</script>-->\n        <property-grid-body property-groups=\"gridData.propertyGroups\" config=\"gridData.config\"></property-grid-body>\n\n    </form>\n\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGridBody.html","<div class=\"property-grid-body\">\n    <div class=\"property-group-container\"\n         data-ng-repeat=\"propertyGroup in propertyGroups\"\n         is-open=\"propertyGroup.expanded\">\n        <div class=\"propertygroup-header\" ng-click=\"propertyGroup.collapsed = !propertyGroup.collapsed\">\n            {{propertyGroup.label}}\n            <i class=\"pull-right glyphicon\"\n               ng-class=\"{\'glyphicon-chevron-down\': !propertyGroup.collapsed, \'glyphicon-chevron-right\': propertyGroup.collapsed}\"></i>\n        </div>\n        <property-group collapse=\"propertyGroup.collapsed\" items=\"propertyGroup.items\" config=\"config\"></property-group>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGridRow.html","<div class=\"property-grid-row row\">\n    <property-label\n        data-ng-if=\"label || label === 0 || label === \'\'\"\n        ng-class=\"{ \'col-lg-2 col-md-3 col-sm-4 col-xs-8\': !unresponsive }\">{{label}}</property-label>\n    <property-value data-ng-repeat=\"value in values\"></property-value>\n</div>");
$templateCache.put("/isis-ui-components/templates/propertyGroup.html","<div class=\"property-group\">\n    <property-grid-row\n         data-ng-repeat=\"item in items\"\n         label=\"item.label\"\n         values=\"item.values\"\n         config=\"config\">\n    </property-grid-row>\n</div>\n");
$templateCache.put("/isis-ui-components/templates/propertyLabel.html","<label class=\"property-label\" ng-transclude>\n</label>");
$templateCache.put("/isis-ui-components/templates/propertyValue.html","<div class=\"property-value\">\n    <value-widget value=\"value\" config=\"config\" unresponsive=\"unresponsive\"></value-widget>\n</div>");
$templateCache.put("/isis-ui-components/templates/searchBox.html","<div class=\"search-box\">\n    <div class=\"input-group input-group-sm\">\n        <div class=\"input-group-btn\">\n            <button type=\"button\" class=\"btn btn-default\" ><span class=\"caret\"></span></button>\n        </div>\n         <input class=\"form-control ng-pristine ng-valid\" ng-model=\"config.$\"\n    placeholder=\"Search...\">\n        <!-- /btn-group -->\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/simpleDialog.html","<div class=\"modal-header\">\n    <h3 class=\"modal-title\">{{ dialogTitle }}</h3>\n</div>\n<div class=\"modal-body\" data-ng-include=\"dialogContentTemplate\">\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n</div>");
$templateCache.put("/isis-ui-components/templates/taxonomyTerm.html","<div class=\"taxonomy-term\"\n        ng-class=\"term.id\">\n    <a ng-attr-href=\"{{::getTermUrl()}}\">{{::term.name}}</a>\n</div>");
$templateCache.put("/isis-ui-components/templates/taxonomyTerms.html","<div class=\"taxonomy-terms\">\n    <taxonomy-term ng-repeat=\"term in terms\" term=\"term\"></taxonomy-term>\n</div>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.header.html","<header>\n    <div class=\"scope-selector\"\n         data-ng-if=\"::ctrl.config.scopeMenu\">\n        <a  class=\"item-label\"\n           isis-contextmenu\n           contextmenu-data=\"::ctrl.config.scopeMenu\"\n           contextmenu-config=\"::ctrl.scopeMenuConfig\"\n                >{{ ctrl.config.selectedScope.label }} <i class=\"fa fa-angle-down\"></i></a>\n    </div>\n    <div class=\"preferences-menu\"\n         data-ng-if=\"::ctrl.config.preferencesMenu\">\n        <a  class=\"item-label\"\n           isis-contextmenu\n           contextmenu-data=\"::ctrl.config.preferencesMenu\"\n           contextmenu-config=\"::ctrl.preferencesMenuConfig\"\n                ><i class=\"glyphicon glyphicon-cog\"></i></a>\n    </div>\n</header>\n");
$templateCache.put("/isis-ui-components/templates/treeNavigator.html","<nav class=\"tree-navigator\">\n    <tree-navigator-header data-ng-if=\"::(ctrl.config.scopeMenu || ctrl.config.preferencesMenu)\"></tree-navigator-header>\n\n    <div class=\"tree-navigator-nodes\">\n\n        <tree-navigator-node-label\n             data-ng-if=\"::ctrl.config.showRootLabel\"\n             node=\"ctrl.treeData\">\n        </tree-navigator-node-label>\n\n\n        <tree-navigator-node-list\n                nodes=\"ctrl.treeData.children\"\n                parent-node=\"ctrl.treeData\">\n        </tree-navigator-node-list>\n\n    </div>\n</nav>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.node.extraInfo.html","<div class=\"extra-info-content\">{{ ctrl.node.extraInfo }}</div>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.node.html","<li title=\"{{ ctrl.node.label }}\"\n    data-ng-class=\"ctrl.getClass()\">\n\n    <tree-navigator-node-label\n            node=\"ctrl.node\"\n            ></tree-navigator-node-label>\n\n    <tree-navigator-node-list\n            ng-if=\"ctrl.isExpanded() && ctrl.node.children\"\n            parent-node=\"ctrl.node\"\n            nodes=\"ctrl.node.children\"\n            config=\"config\"></tree-navigator-node-list>\n</li>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.node.label.html","<div class=\"node-label\"\n      data-isis-sglclick=\"::ctrl.nodeClick($event)\"\n      data-ng-dblclick=\"::ctrl.nodeDblclick($event)\">\n    <div isis-contextmenu\n         contextmenu=\"::ctrl.nodeContextmenu($event)\"\n         contextmenu-data=\"ctrl.nodeContextMenuData\">\n        <a class=\"node-expander\"\n            isis-stop-event\n            data-ng-if=\"ctrl.canExpand() && ctrl.canCollapse()\"\n            data-isis-sglclick=\"::ctrl.nodeExpanderClick($event)\">\n            <i data-ng-if=\"!ctrl.isExpanded()\" data-ng-class=\"::ctrl.getCollapsedIconClass()\"></i>\n            <i data-ng-if=\"ctrl.isExpanded() && ctrl.canCollapse()\" data-ng-class=\"::ctrl.getExpandedIconClass()\"></i>\n        </a>\n        <span class=\"label-and-extra-info\"\n              ng-attr-draggable=\"{{ctrl.node.draggable}}\">\n            <i data-ng-if=\"::(ctrl.node.childrenCount && ctrl.treeCtrl.config.folderIconClass || ctrl.node.iconClass || ctrl.treeCtrl.config.nodeIconClass)\"\n               data-ng-class=\"::(ctrl.node.childrenCount && ctrl.treeCtrl.config.folderIconClass || ctrl.node.iconClass || ctrl.treeCtrl.config.nodeIconClass)\"></i>\n            <span>\n                <span class=\"label-text\"\n                      data-ng-if=\"ctrl.node.label\">{{ ctrl.node.label }}</span>\n                <span class=\"noname\"\n                      data-ng-if=\"!ctrl.node.label\">No name</span>\n                <span data-ng-if=\"ctrl.node.extraInfo\">\n                    <div class=\"node-extra-info\" ng-include=\"ctrl.treeCtrl.config.extraInfoTemplateUrl\"></div>\n                </span>\n            </span>\n        </span>\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/treeNavigator.nodeList.html","<ul class=\"node-list\">\n\n    <li class=\"loading-cover\"></li>\n\n    <li ng-if=\"ctrl.isPageable() && ctrl.showPageUp()\"\n        ng-attr-title=\"{{::ctrl.getLoadMoreText()}}\"\n        class=\"paging page-up\" ng-click=\"ctrl.pageUp($event)\">\n        <a href>{{::ctrl.getLoadMoreText()}}\n            <i class=\"glyphicon glyphicon-chevron-up\"></i>\n            <span class=\"first-loaded-child-position\">\n                {{ctrl.parentNode.firstLoadedChildPosition }}\n            </span>\n        </a>\n    </li>\n\n    <tree-navigator-node\n        data-ng-repeat=\"node in ctrl.nodes\"\n        node=\"node\"\n            ></tree-navigator-node>\n    <li ng-if=\"ctrl.isPageable() && ctrl.showPageDown()\"\n        ng-attr-title=\"{{::ctrl.getLoadMoreText()}}\"\n        class=\"paging page-down\" ng-click=\"ctrl.pageDown($event)\">\n        <a href>{{::ctrl.getLoadMoreText()}}\n            <i class=\"glyphicon glyphicon-chevron-down\"></i>\n            <span class=\"last-loaded-child-position\">\n                {{ ctrl.parentNode.childrenCount - (ctrl.parentNode.lastLoadedChildPosition + 1)}}\n            </span>\n        </a>\n    </li>\n</ul>\n");
$templateCache.put("/isis-ui-components/templates/validationErrorMarker.html","<div class=\"validation-error-marker\">\n    <i class=\"trigger-icon glyphicon glyphicon-info-sign\"\n        ng-if=\"invalid && !embedded\"\n        isis-contextmenu\n        contextmenu-config=\"errorMenuConfig\">\n    </i>\n    <div class=\"embedded-messages\"\n         ng-if=\"invalid && embedded\"\n         data-ng-include=\"\'/isis-ui-components/templates/validationErrorMarkerMessages.html\'\">\n    </div>\n</div>");
$templateCache.put("/isis-ui-components/templates/validationErrorMarkerMessages.html","<div class=\"validation-error-marker-messages\">\n    <ul>\n        <li ng-repeat=\"errorMessage in getValidationErrorMessages()\">{{errorMessage}}</li>\n    </ul>\n</div>");}]);