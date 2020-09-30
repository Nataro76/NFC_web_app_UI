define([
    'angular',
    'libbf',
    'module',     // this is the requirejs module defined in { config: { 'app.main': ... } }, not an angularjs module like in the rest of the code
    './modules/index',
], function( angular, libbf, rjsModule ) {
    'use strict';

    const i18n = libbf.i18n;
    const bfBaseUrl = rjsModule.config().bfBaseUrl;
    const appBaseUrl = '/skel';

    libbf.setApplicationID( 'BigFamily', bfBaseUrl );
    libbf.useThemes( false );

    var module = angular.module('app', [
        'ngMessages', 'ngMaterial', 'ngCookies', 'ui.router',
        'libbf',
        'libbf.ui',
        'app.modules',
    ]);

    module.constant( 'APP_URL', appBaseUrl+'/api' );
    module.constant( 'LANDING_PAGE', 'home' );

    // we need to create the real menu service
    new libbf.MenuService([
        {
            name:  "General",
            label: i18n( "General" ),
            items: [
                { label: i18n( 'Home' ),    name: 'Home',      sref: 'home'  },
                { label: i18n( 'About' ),   name: 'About',     sref: 'about' },
            ]
        },
    ]);

    module.controller('AppCtrl', ['$scope', '$mdSidenav', '$state', 'BFAuthService', 'bfMenuService',
      function ($scope, $mdSidenav, $state,  AuthService, menu ) {

        $scope.auth = AuthService;

        $scope.openSideNavPanel = function() {
            $mdSidenav('mainMenu').open();
        };

        $scope.closeSideNavPanel = function() {
            $mdSidenav('mainMenu').close();
        };

        $scope.logout = AuthService.logout;

        $scope.menu = menu;
        console.log( "menu", menu);
        $scope.menu.onSelect = function() {
            $mdSidenav('mainMenu').close();
        };

        $scope.apps = [
            { url: '/',         icon: '/resources/icons/bf-home-48x48.png',       label: 'Home'      },
            { url: '/bd',       icon: '/resources/icons/big-daddy-48x48.png',     label: 'Big daddy' },
            { url: '/bm',       icon: '/resources/icons/big-mama-48x48.png',      label: 'Big mama'  },
            { url: '/bn',       icon: '/resources/icons/big-nonna-48x48.png',     label: 'Big nonna' },
            { url: '/openmct',  icon: '/resources/icons/nasa-logo-48x48.png',     label: 'OpenMCT'   },
            { url: '/node-red', icon: '/resources/icons/node-red-icon-48x48.png', label: 'Node-red'  },
            { url: '/Grafana',  icon: '/resources/icons/grafana-logo-48x48.png',  label: 'Grafana'   },
        ];
    }]);

    return module;
});

