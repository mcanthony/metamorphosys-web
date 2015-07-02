'use strict';

require('./testBenchResultAndTime.jsx');
require('./testBenchConfig.js');

angular.module('mms.testBenchDrawerPanel', [
    'cyphy.services',
    'mms.testBenchDrawerPanel.resultAndTime',
    'mms.testBenchDrawerPanel.testBenchConfig'
])

.directive('testBenchDrawerPanelTestList', function() {

    function TestListController(testBenchService) {

        var self = this,
            testBenches = testBenchService.getTestBenches();

        this.listData = {
            items: []
        };

        testBenches.then(function (testBenches) {
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
                        console.log('Run test bench from here', item);
                        testBenchService.runTestBench(item.id)
                    },
                    openLastResult: function(item) {
                        console.log('Last result should be opened', item);
                    }

                };

                console.log(testBench);

                self.listData.items.push(listItem);

            });
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,
            showDetailsLabel: 'Configure',
            hideDetailsLabel: 'Configure',

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
            },
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
            testBenchResults = testBenchService.getTestBenchResults(),
            setListItems = function (testBenchResults) {
                self.listData.items.splice(0, self.listData.items.length);
                testBenchResults.forEach(testBenchResult => {

                    var listItem = {
                        id: testBenchResult.id,
                        title: testBenchResult.testBench && testBenchResult.testBench.name,
                        headerTemplateUrl: '/mmsApp/templates/resultListHeaderTemplate.html'
                    };

                    self.listData.items.push(listItem);
                });
            };

        this.listData = {
            items: []
        };

        testBenchResults.then(setListItems);

        function onResultsChanged(event) {
            setListItems(event.data);
        }

        testBenchService.addEventListener('resultsChanged', onResultsChanged);

        $scope.$on('$destroy', function() {
            testBenchService.removeEventListener('resultsChanged', onResultsChanged);
        });

        this.config = {

            sortable: false,
            secondaryItemMenu: false,
            detailsCollapsible: true,

            itemClick: function (event, item) {
                console.log('Clicked: ' + item);
            },
            detailsRenderer: function (item) {
                item.details = 'My details are here now!';
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
        templateUrl: '/mmsApp/templates/testBenchDrawerPanelResultList.html'
    };
});
