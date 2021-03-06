'use strict';

/* globals ga */

require('./testBenchResultAndTime.jsx');
require('./testBenchResultDetails.js');
require('./testBenchConfig.js');

angular.module('mms.testBenchDirectives', ['ngAnimate']);

require('../testBenchDirectives/costEstimation.jsx');
require('../testBenchDirectives/placeAndRoute.jsx');
require('../testBenchDirectives/analogElectronicSimulation.jsx');
require('../testBenchDirectives/cadPcb.jsx');

var compiledDirectives = {};

function TestBenchStartedToastController($scope, $mdToast, message) {

    $scope.progressMessage = message;

    $scope.closeToast = function () {
        $mdToast.hide();
    };

}

function TestBenchCompletedToastController($scope, $mdToast, message, result, success) {

    $scope.result = result;

    $scope.success = success;

    $scope.progressMessage = message || 'Job execution has started...';

    $scope.closeToast = function () {
        $mdToast.hide();
    };

}


angular.module('mms.testBenchDrawerPanel', [
    'cyphy.services',
    'mms.testBenchDrawerPanel.resultAndTime',
    'mms.testBenchDrawerPanel.testBenchResultDetails',
    'mms.testBenchDrawerPanel.testBenchConfig',
    'ngMaterial',

    'mms.testBenchDirectives'
])
.run(function($mdToast, testBenchService) {

    testBenchService.addEventListener(
        'testBenchStarted',
        function(e) {

            $mdToast.show({
                    controller: TestBenchStartedToastController,
                    templateUrl: '/mmsApp/templates/testBenchStartedToast.html',
                    locals: {
                        message: e.data.name + ' started'
                    },
                    hideDelay: 5000
                }
            );
        }
    );

    testBenchService.addEventListener(
        'testBenchCompleted',
        function(e) {

            var message,
                delay,
                success = false,
                testBench = e.data.testBench,
                result = e.data;

            if (result.status === 'Succeeded') {
                message = testBench.name + ' completed';
                delay = 5000;
                success = true;
            } else {
                message = testBench.name + ' errored';
                delay = 5000;
            }

            $mdToast.show({
                    controller: TestBenchCompletedToastController,
                    templateUrl: '/mmsApp/templates/testBenchCompletedToast.html',
                    locals: {
                        result: result,
                        message: message,
                        success: success
                    },
                    hideDelay: delay
                }
            );
        }
    );

    testBenchService.addEventListener(
        'testBenchException',
        function() {
            // Show TB error message here
        }
    );

})
.directive('testBenchDrawerPanelTestList', function() {

    function TestListController($scope, testBenchService) {

        var self = this;

        this.listData = {
            items: []
        };

        testBenchService.getTestBenches().then(function (testBenches) {
            testBenches.forEach(testBench => {

                var listItem = {
                    id: testBench.id,
                    title: testBench.name,
                    headerTemplateUrl: '/mmsApp/templates/testListHeaderTemplate.html',
                    detailsTemplateUrl: '/mmsApp/templates/testListDetailsTemplate.html',
                    configDirective: 'dummy-test-bench-config',
                    testBench: testBench,
                    details: true,
                    runTest: function (item) {
                        testBenchService.runTestBench(item.id);
                    }
                };

                //console.log(testBench);

                self.listData.items.push(listItem);

            });
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,
            showDetailsLabel: 'Configure',
            hideDetailsLabel: 'Configure',

            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            }

        };

    }

    return {
        restrict: 'E',
        controller: TestListController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: true,
        scope: true,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelTestList.html'
    };
})

.directive('testBenchDrawerPanelResultList', function() {

    function ResultListController($scope, testBenchService) {

        var self = this,
            testBenchResultsPromise = testBenchService.getTestBenchResults(),

            setListItems = function (testBenchResults) {

                if (testBenchResults) {
                    self.listData.items.splice(0, self.listData.items.length);

                    testBenchResults.forEach(testBenchResult => {

                        var listItem = {
                            id: testBenchResult.id,
                            title: testBenchResult.testBench && testBenchResult.testBench.name,
                            headerTemplateUrl: '/mmsApp/templates/resultListHeaderTemplate.html',
                            result: testBenchResult,
                            expanded: false
                        };

                        self.listData.items.push(listItem);

                    });

                    self.listData.items.reverse();

                }
            };

        this.listData = {
            items: []
        };

        testBenchResultsPromise.then(setListItems);

        function onResultsChanged(event) {
            setListItems(event.data.results);
        }

        testBenchService.addEventListener('resultsChanged', onResultsChanged);

        $scope.$on('$destroy', function() {
            testBenchService.removeEventListener('resultsChanged', onResultsChanged);
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,

            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
            },

            toggleDetailsExpander: function (item) {
                item.expanded = !item.expanded;
            }

        };

    }

    return {
        restrict: 'E',
        controller: ResultListController,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: true,
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelResultList.html',
        require: ['testBenchResultDeleter']
    };
})
.directive('testBenchResultOpener', function($compile) {

    function CompactResultOpenerController() {

        var self = this;

        this.resultsOpener = function () {
            var downloadUrl = '/rest/blob/download/' + self.result.resultHash;
            ga('send', 'event', 'testbench', 'result', self.result.id);
            window.open(downloadUrl, '_blank');
        };

        this.openResults = function() {

            if (self.resultsOpener) {
                self.resultsOpener();
            }

        };

    }

    return {
        restrict: 'E',
        bindToController: true,
        controller: CompactResultOpenerController,
        controllerAs: 'ctrl',
        replace: true,
        transclude: false,
        templateUrl: '/mmsApp/templates/testBenchResultOpener.html',
        scope: {
            result: '='
        },
        require: ['testBenchResultOpener'],
        link: function(scope, element, attr, controllers) {

            var ctrl = controllers[0],
                resultCompactDirective,
                compiledDirective,
                resultCompactElement;

            resultCompactDirective =
                ctrl.result &&
                ctrl.result.testBench.directives &&
                ctrl.result.testBench.directives.resultCompact;

            if (resultCompactDirective) {

                    compiledDirective = compiledDirectives[resultCompactDirective];

                    if (!compiledDirective) {

                        compiledDirective = $compile(
                            angular.element(
                                '<' + resultCompactDirective + ' result="result">' +
                                '</' + resultCompactDirective + '>'
                            )
                        );

                        compiledDirectives[resultCompactDirective] = compiledDirective;

                    }

                    scope.result = ctrl.result;

                    compiledDirective(scope, function(clonedElement) {

                        resultCompactElement = clonedElement[0];

                        var placeHolderEl = element[0].querySelector('.compact-results');

                        placeHolderEl.innerHTML = '';

                        placeHolderEl.appendChild(resultCompactElement);

                    });

            }
        }
    };
})
.directive('testBenchResultDeleter', function($mdDialog) {

    function TestBenchResultDeleterController() {

    }

    return {
        restrict: 'E',
        controller: TestBenchResultDeleterController,
        controllerAs: 'ctrl',
        bindToController: true,
        replace: true,
        transclude: false,
        scope: {
            result: '='
        },
        templateUrl: '/mmsApp/templates/testBenchResultDeleter.html',
        require: ['testBenchResultDeleter'],
        link: function(s, element, attributes, controllers) {

            var ctrl = controllers[0];

            function checkDelete() {

                ga('send', 'event', 'testbench', 'result', ctrl.result.id);

                function DeleteResultDialogController($scope, result, testBenchService) {

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };

                    $scope.result = result;

                    $scope.deleteResult = function () {
                        testBenchService.removeResult(result);
                        $scope.hide();
                    };
                }


                $mdDialog.show({
                    controller: DeleteResultDialogController,
                    bindToController: true,
                    controllerAs: 'ctrl',
                    templateUrl: '/mmsApp/templates/testBenchResultDeleteDialog.html',
                    locals: {
                        result: ctrl.result
                    }
                })
                .then(function () {
                });

            }

            ctrl.checkDelete = checkDelete;

        }
    };

});
