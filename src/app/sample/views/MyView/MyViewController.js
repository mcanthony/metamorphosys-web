/*globals angular, console */

angular.module('CyPhyApp')
    .controller('MyViewController', function ($scope, DataStoreService, ProjectService) {
        'use strict';

        console.log('MyViewController');

        $scope.model = {
            name: 'listing projects [set from controller]',
            projectIds: []
        };

        DataStoreService.connectToDatabase('my-db-connection-id', {host: window.location.basename})
            .then(function () {
                console.log('connected');
            })
            .catch(function (reason) {
                console.error(reason);
            })

        ProjectService.on('my-db-connection-id', 'initialize', function () {
            ProjectService.getProjects('my-db-connection-id')
                .then(function (projectIds) {
                    $scope.model.projectIds = projectIds;
                })
                .catch(function (reason) {
                    console.error(reason);
                });
        });
    });
