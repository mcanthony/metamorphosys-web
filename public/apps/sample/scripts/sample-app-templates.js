angular.module("cyphy.sample.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/sample/templates/MyView.html","<div data-ng-controller=\"MyViewController\" class=\"my-view\">\n    <h1>My view is here <small>{{ model.name }}</small></h1>\n    <h4>List of projects in this deployment</h4>\n    <ul>\n        <li data-ng-repeat=\"projectId in model.projectIds\">{{ projectId }}</li>\n    </ul>\n</div>\n");}]);