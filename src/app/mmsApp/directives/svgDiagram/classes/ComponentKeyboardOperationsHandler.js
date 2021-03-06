/*globals angular*/

'use strict';

var LockedComponentWireToast = require('../classes/lockedComponentWiresToast.js'),
    HelperMethods = require('../classes/svgDiagramHelperMethods.js');

module.exports = function($scope, $rootScope, operationsManager, mmsUtils, $mdToast) {

    $scope.$on('keydownOnDocument', function($event, event) {

        var operation,
            component,
            primaryTargetDescriptor,
            possibbleDragTargetsDescriptor,
            selectedComponents,
            componentsToDrag,
            multiplier,
            offset,
            getDragDescriptor,
            helperMethods = new HelperMethods();

        getDragDescriptor = function(component) {

            var offset = {
                x: 0,
                y: 0
            };

            return {
                component: component,
                originalPosition: {
                    x: component.x,
                    y: component.y
                },
                deltaToCursor: {
                    x: component.x - offset.x,
                    y: component.y - offset.y
                }
            };

        };

        if ( mmsUtils.ifNotFromInput(event) &&  $scope.diagram && $scope.diagram.state) {

            selectedComponents = $scope.diagram.getSelectedComponents();

            // Delete

            if (event.keyCode === 8 || event.keyCode === 46) {

                $rootScope.$emit('selectedDiagramThingsDeletionMustBeDone', $scope.diagram);

            }

            // Enter

            if (event.keyCode === 13 && selectedComponents.length === 1) {

                component = selectedComponents[0];

                if (component.metaType === 'Container') {
                    $rootScope.$emit('containerMustBeOpened', component);
                }

            }

            // Rotate: r, Sh-r

            if (event.keyCode === 82 && !(event.ctrlKey || event.metaKey)) {

                var invalidMove = $scope.diagram.getSelectedComponents()
                        .every(function(component) {
                            return helperMethods.ensureNoLockedWires($scope.diagram, component);
                        });

                if ( !invalidMove ) {

                    var lockedComponentWireToast = new LockedComponentWireToast($mdToast, $rootScope,
                            $scope.diagram.getSelectedComponents());

                    lockedComponentWireToast.showToast("Locked wires preventing component(s) from being rotated. Override wire locks?");
                }
                else {
                    operation = operationsManager.initNew(
                        'RotateComponents',
                        $scope.diagram,
                        $scope.diagram.getSelectedComponents()[0]
                    );
                    operation.set(event.shiftKey ? -90 : 90);
                    operation.finish();
                }
            }


            // Translate: 38, 39, 40, 37

            if (event.keyCode >= 37 && event.keyCode <= 40) {

                component = selectedComponents[0];

                if (event.shiftKey) {
                    multiplier = 10;
                } else {
                    multiplier = 1;
                }

                if (component.locationLocked !== true) {

                    primaryTargetDescriptor = getDragDescriptor(component);

                    possibbleDragTargetsDescriptor = {
                        primaryTarget: primaryTargetDescriptor,
                        targets: [primaryTargetDescriptor]
                    };

                    componentsToDrag = [];


                    // Drag along other selected components

                    angular.forEach($scope.diagram.state.selectedComponentIds, function(selectedComponentId) {

                        var selectedComponent;

                        selectedComponent = $scope.diagram.getComponentById(selectedComponentId);

                        possibbleDragTargetsDescriptor.targets.push(getDragDescriptor(
                            selectedComponent));

                        componentsToDrag.push(selectedComponent);

                    });

                    possibbleDragTargetsDescriptor.affectedWires = $scope.diagram.getWiresForComponents(
                        componentsToDrag
                    );

                    possibbleDragTargetsDescriptor.componentsBeingDragged = componentsToDrag;

                    possibbleDragTargetsDescriptor.selectedSegmentEndcornerIds = $scope.diagram.getSelectedSegmentEndcornerIds();

                    operation = operationsManager.initNew(
                        'MoveComponents',
                        $scope.diagram,
                        possibbleDragTargetsDescriptor
                    );


                    if (event.keyCode === 38) {
                        offset = {
                            x: 0,
                            y: -10 * multiplier
                        };
                    }

                    if (event.keyCode === 39) {
                        offset = {
                            x: 10 * multiplier,
                            y: 0
                        };
                    }

                    if (event.keyCode === 40) {
                        offset = {
                            x: 0,
                            y: 10 * multiplier
                        };
                    }

                    if (event.keyCode === 37) {
                        offset = {
                            x: -10 * multiplier,
                            y: 0
                        };
                    }

                    operation.set(offset);

                    operation.finish();
                }
            }

            // Duplicate

            if (event.keyCode === 68 && event.altKey) {

                component = selectedComponents[0];                

                $rootScope.$emit('componentDuplicationMustBeDone', component);

            }


        }

    });

    return this;

};
