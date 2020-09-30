define([
    'angular',
    './home/index',
    './about/index',
    './userPrefs/index',
], function( angular ) {
    return angular.module('app.modules', [
        'app.home',
        'app.about',
        'app.userPrefs',
    ]);
});
