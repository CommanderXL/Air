/**
 * Created by XRene on 2015/11/10.
 */

    define(['common/common_service', 'common/common_directive'], function () {
        var app = angular.module('app', ['ui.router', 'oc.lazyLoad', 'commonService', 'commonDirective']);

        app.run(function ($rootScope, $state, $stateParams) {
            $rootScope.isShow = true;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        });

        app.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
            $ocLazyLoadProvider.config({jsLoader: requirejs});
        }]);

        app.config(function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/login');

            $stateProvider.state('login', {
                url: '/login',
                //templateUrl: './partials/login/login-302e7c7e9a.html',
                views: {
                    'main': {
                        templateUrl: './partials/login/login-302e7c7e9a.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['controllers/login_controller']);
                            }]
                        }
                    }
                }
            });

            $stateProvider.state('index', {
                url: '/index',
                views: {
                    panel: {
                        templateUrl: './partials/index/index-e42d7dcb83.html',
                    }
                }
            })

            $stateProvider.state('index.control', {
                url: '/control',
                //templateUrl: './partials/control/control-f7ef87125f.html'
                views: {
                    sub: {
                        templateUrl: './partials/control/control-f7ef87125f.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['controllers/control_controller']);
                            }]
                        }
                    }
                }

            });

            $stateProvider.state('index.time-switch', {
                url: '/time-switch',
                views: {
                    sub: {
                        templateUrl: './partials/timeSwitch/time_switch-5dfd54b86a.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['controllers/time_controller']);
                            }]
                        }
                    }
                }
                /*templateUrl: './partials/timeSwitch/time_switch-5dfd54b86a.html'*/
            });

            $stateProvider.state('index.chart', {
                url: '/chart',
                views: {
                    sub: {
                        templateUrl: './partials/charts/chart.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['directives/chartOne_directive']);
                            }]
                        }
                    }
                }
                /*templateUrl: './partials/charts/chart.html'*/
            });

            $stateProvider.state('index.table', {
                url: '/table',
                views: {
                    sub: {
                        templateUrl: './partials/tables/tables-eb7e843708.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['controllers/table_controller']);
                            }]
                        }
                    }
                }
                /*templateUrl: './partials/tables/tables-eb7e843708.html'*/
            });

            $stateProvider.state('index.status', {
                url: '/status',
                views: {
                    sub: {
                        templateUrl: './partials/status/status-2ad29083d1.html',
                        resolve: {
                            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['controllers/status_controller']);
                            }]
                        }
                    }
                }
                //templateUrl: './partials/status/status-2ad29083d1.html'
            })
        });

        return app;
    });


