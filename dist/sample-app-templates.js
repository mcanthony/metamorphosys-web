angular.module("cyphy.sample.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/sample/templates/index.html","<!DOCTYPE html>\n<html>\n<head lang=\"en\">\n    <meta charset=\"UTF-8\">\n\n    <!-- Include CSS library dependencies -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/bootstrap/dist/css/bootstrap.min.css\">\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/jquery-ui/themes/black-tie/jquery-ui.css\">\n    <link type=\"text/css\" href=\"/extlib/bower_components/font-awesome/css/font-awesome.min.css\" rel=\"stylesheet\">\n\n    <!-- Include CSS isis-ui-components -->\n    <link type=\"text/css\" rel=\"stylesheet\" href=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.css\">\n\n    <!-- Include CSS cyphy-components -->\n\n    <title></title>\n</head>\n<body>\n\n<!-- TODO: add your html here -->\n<div data-ng-include=\"\'/sample/templates/MyView.html\'\"></div>\n\n<!-- Include library dependencies -->\n<script src=\"/extlib/bower_components/jquery/dist/jquery.min.js\"></script>\n<script src=\"/extlib/bower_components/jquery-ui/jquery-ui.min.js\"></script>\n<script src=\"/extlib/bower_components/angular/angular.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-router/release/angular-ui-router.min.js\"></script>\n<script src=\"/extlib/bower_components/bootstrap/dist/js/bootstrap.min.js\"></script>\n<script src=\"/extlib/bower_components//angular-bootstrap/ui-bootstrap-tpls.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n<script src=\"/extlib/bower_components/ng-grid/build/ng-grid.min.js\"></script>\n<script src=\"/extlib/bower_components/angular-ui-utils/ui-utils.min.js\"></script>\n\n\n<!-- Include WebGME libraries -->\n<!--  client -->\n<script src=\"/extlib/node_modules/webgme/dist/webgme.classes.build.js\"></script>\n<!--  angular module services-->\n<!--<script src=\"/extlib/node_modules/webgme/src/client/js/services/gme-services.js\"></script>-->\n<script src=\"/extlib/node_modules/ng-gme/dist/ng-gme.js\"></script>\n\n<!-- Include isis-ui-components -->\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components.js\"></script>\n<script src=\"/extlib/bower_components/isis-ui-components/dist/isis-ui-components-templates.js\"></script>\n\n<!-- Include cyphy-components -->\n<script src=\"/extlib/dist/cyphy-components.js\"></script>\n<script src=\"/extlib/dist/cyphy-components-templates.js\"></script>\n\n<!-- Include application -->\n<script src=\"/extlib/dist/sample-app.js\"></script>\n<script src=\"/extlib/dist/sample-app-templates.js\"></script>\n\n<!-- Start the main application -->\n<script type=\"text/javascript\">\n    var clientLoaded,\n            timeout = 5000,\n            waitCounter = 0,\n            i,\n            success,\n            usedClasses = [\"Client\"],\n            interval = 200,\n            waitForLoadId = setInterval(function () {\n                if (window.GME &&\n                    window.GME.classes) {\n                    // TODO: check for all classes that we use\n                    clearInterval(waitForLoadId);\n                    success = true;\n\n                    for (i = 0; i < usedClasses.length; i += 1) {\n                        if (window.GME.classes.hasOwnProperty(usedClasses[i])) {\n                            console.log(\'WebGME \' + usedClasses[i] + \' is available.\');\n                        } else {\n                            console.error(\'WebGME \' + usedClasses[i] + \' was not found.\');\n                            success = false;\n                        }\n                    }\n\n                    if (success) {\n                        console.log(\'WebGME client library is ready to use.\');\n                        clientLoaded();\n                    }\n                } else {\n                    console.log(\'Waiting for WebGME client library to load.\');\n                    waitCounter += 1;\n                    if (waitCounter >= timeout / interval) {\n                        clearInterval(waitForLoadId);\n                        console.error(\'WebGME client library was not loaded within a reasonable time. (\' + (timeout / 1000) + \' s)\');\n                    }\n                }\n            }, interval);\n\n    clientLoaded = function () {\n        // main entry point of the app.js\n        // once the webgme Client is loaded and ready we can use it.\n\n        angular.bootstrap(document, [\'CyPhyApp\']);\n    };\n</script>\n\n</body>\n</html>");
$templateCache.put("/sample/templates/MyView.html","<div data-ng-controller=\"MyViewController\">\n    <h1>My view is here <small>{{ model.name }}</small></h1>\n    <h4>List of projects in this deployment</h4>\n    <ul>\n        <li data-ng-repeat=\"projectId in model.projectIds\">{{ projectId }}</li>\n    </ul>\n</div>");}]);