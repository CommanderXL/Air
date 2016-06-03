/**
 * Created by XRene on 16/5/15.
 */
require.config({
    baseUrl: './partials',
    paths: {
        'angular': '../components/angular.min',
        'uiRouter': '../components/angular-ui-router.min',
        'highchart': '../components/highchart',
        'jquery': '../components/jquery-2.1.3.min',
        'pikaday': '../components/pikaday.min',
        '_': '../components/underscore-min',
        'oclazyload': '../components/ocLazyLoad.require'
    },
    shim: {
        'app': {
            deps: ['angular', 'uiRouter', 'oclazyload', 'jquery', '_', 'pikaday']
        },
        'uiRouter': {
            deps: ['angular']
        },
        'oclazyload': ['angular']
    },

    urlArgs: 'kt-20161463306492740'
});

require(['app'], function () {
    angular.bootstrap(document, ['app']);
});