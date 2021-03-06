/*globals angular, ga*/

'use strict';

var wiringServicesModule = angular.module(
    'mms.designVisualization.wiringService', []);

wiringServicesModule.service('wiringService', ['$mdToast', '$log', '$rootScope', '$timeout', '$injector',
    function ($mdToast, $log, $rootScope, $timeout, $injector) {

        var self = this,
            SimpleRouter = require('./classes/SimpleRouter.js'),
            ElbowRouter = require('./classes/ElbowRouter.js'),
            OrthogonalRouter = require('./classes/OrthogonalRouter.js'),
            routers = {

                SimpleRouter: new SimpleRouter(),
                ElbowRouter: new ElbowRouter(),
                OrthogonalRouter: new OrthogonalRouter($mdToast, $injector)

            },

            DEFAULT_ROUTER = {
                type: 'SimpleRouter',
                params: null
            };

        this.selectedRouter =
            {
                id: 'autoRouter',
                label: 'Auto Router',
                type: 'OrthogonalRouter'
            };

        this.getRouterTypes = function () {

            return [

                {
                    id: 'autoRouter',
                    label: 'Auto Router',
                    type: 'OrthogonalRouter'
                },

                // {
                //     id: 'elbowHorizontal',
                //     label: 'Elbow - horizontal first',
                //     type: 'ElbowRouter',
                //     params: 'horizontalFirst'
                // },

                // {
                //     id: 'elbowVertical',
                //     label: 'Elbow - vertical first',
                //     type: 'ElbowRouter',
                //     params: 'verticalFirst'
                // },

                {
                    id: 'simpleRouter',
                    label: 'Straight wire',
                    type: 'SimpleRouter'
                }

            ];

        };

        this.lockWire = function (wire) {

            ga('send', 'event', 'wire', 'lock', wire.getId());

            wire.lockWire(wire);

            $rootScope.$emit('wireLockMustBeSaved', wire, true, 'Locking wire');

        };

        this.unlockWire = function (wire) {

            ga('send', 'event', 'wire', 'unlock', wire.getId());

            wire.unlockWire(wire);

            $rootScope.$emit('wireLockMustBeSaved', wire, false, 'Unlocking wire');

        };

        this.getSegmentsBetweenPositions = function (endPositions, routerType, params, simplify) {

            var segments,
                router;

            router = routers[routerType] || 'SimpleRouter';

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {
                segments = router.makeSegments(
                    [endPositions.end1, endPositions.end2],
                    params,
                    simplify
                );
            }

            return segments;

        };

        /* AutoRouter Wiring Functions */
        this.autoRoute = function(diagram, routerType, specificWireToRoute) {

            var router = routers[routerType];

            if (router && angular.isFunction(router.route)) {
                if (specificWireToRoute) {
                    router.route(diagram, specificWireToRoute);
                }
                else {
                    router.route(diagram);
                }
            }

        };

        this.rerouteDiagram = function(diagram, routerType) {

            var router = routers[routerType];

            if (router && angular.isFunction(router.routeDiagram)) {
                router.routeDiagram(diagram);
            }

        };

        /* For Elbow and Simple Routers */
        this.routeWire = function (wire, routerType, params, ignoreLeadIn) {

            var router,
                simpleRouter,
                elbowRouter,

                endPositions,
                p1,
                p2,
                s1, s2, s3;


            simpleRouter = routers.SimpleRouter;
            elbowRouter = routers.ElbowRouter;

            router = routers[routerType] || simpleRouter;

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

                endPositions = wire.getEndPositions();

                if (endPositions) {

                    s1 = [];
                    s2 = [];
                    s3 = [];

                    if (endPositions.end1.leadInPosition && !ignoreLeadIn) {

                        s1 = elbowRouter.makeSegments([
                            endPositions.end1,
                            endPositions.end1.leadInPosition
                        ]);

                        p1 = endPositions.end1.leadInPosition;

                    } else {
                        p1 = endPositions.end1;
                    }


                    if (endPositions.end2.leadInPosition && !ignoreLeadIn) {

                        s3 = elbowRouter.makeSegments([
                            endPositions.end2.leadInPosition,
                            endPositions.end2
                        ]);

                        p2 = endPositions.end2.leadInPosition;

                    } else {
                        p2 = endPositions.end2;
                    }

                    s2 = router.makeSegments([
                        p1,
                        p2
                    ], params);

                    wire.makeSegmentsFromParameters(s1.concat(s2).concat(s3));

                }

            }

        };

        this.adjustWireEndSegments = function (wire) {

            var firstSegmentParams,
                secondSegmentParams,
                secondToLastSegmentParams,
                lastSegmentParams,
                endPositions = wire.getEndPositions(),
                segments = wire.getSegments(),
                newSegmentParameters,
                router,
                pos;

            if (Array.isArray(segments) && segments.length > 1) {

                // If this wire has more than one segments

                // Creating new begining for wire

                firstSegmentParams = segments[0].getParameters();
                router = firstSegmentParams.router || DEFAULT_ROUTER;

                if (router && router.type === 'ElbowRouter') {

                    secondSegmentParams = segments[1].getParameters();

                    pos = {
                        x: secondSegmentParams.x2,
                        y: secondSegmentParams.y2
                    };

                } else {

                    // Use SimpleRouter

                    pos = {
                        x: firstSegmentParams.x2,
                        y: firstSegmentParams.y2
                    };

                }

                newSegmentParameters = self.getSegmentsBetweenPositions(
                    {
                        end1: endPositions.end1,
                        end2: pos
                    },
                    router.type,
                    router.params
                );

                newSegmentParameters[0]._id = firstSegmentParams._id;
                newSegmentParameters[0].endCornerSelected = firstSegmentParams.endCornerSelected;
                if (newSegmentParameters.length > 1) {
                    newSegmentParameters[1]._id = secondSegmentParams._id;
                    newSegmentParameters[1].endCornerSelected = secondSegmentParams.endCornerSelected;
                }

                wire.replaceSegmentsFromParametersArray(0, newSegmentParameters, true);


                // Creating new end for wire

                lastSegmentParams = segments[segments.length - 1].getParameters();
                router = lastSegmentParams.router || DEFAULT_ROUTER;

                if (router && router.type === 'ElbowRouter') {

                    secondToLastSegmentParams = segments[segments.length - 2].getParameters();

                    pos = {
                        x: secondToLastSegmentParams.x1,
                        y: secondToLastSegmentParams.y1
                    };

                } else {

                    // Use SimpleRouter

                    pos = {
                        x: lastSegmentParams.x1,
                        y: lastSegmentParams.y1
                    };

                }

                newSegmentParameters = self.getSegmentsBetweenPositions(
                    {
                        end1: pos,
                        end2: endPositions.end2
                    },
                    router.type,
                    router.params
                );

                newSegmentParameters[0]._id = lastSegmentParams._id;
                newSegmentParameters[0].endCornerSelected = lastSegmentParams.endCornerSelected;
                if (newSegmentParameters.length > 1) {
                    newSegmentParameters[1]._id = secondToLastSegmentParams._id;
                    newSegmentParameters[1].endCornerSelected = secondToLastSegmentParams.endCornerSelected;
                }

                wire.replaceSegmentsFromParametersArray(segments.length - newSegmentParameters.length, newSegmentParameters, true);

            } else {

                //Simple-routing

                self.routeWire(wire, null, null, true);
            }

        };

    }
]);
