define([ 'require', './module', 'libbf' ], function (require, module, libbf) {

  module
    .component('userPrefsComp', { bindings: { about: '<', dashboards: '<' }, templateUrl: require.toUrl( './template.html' ), controller: 'userPrefsCtrl' })
    .config(['$stateProvider', function($stateProvider) {
      $stateProvider.state({
        name:      'userPrefs',
        url:       '/userPrefs',
        component: 'userPrefsComp',
        resolve:   {
            model: [ "BFUserPrefsService", function(s) { return s.get(); } ],
            dashboards: [ "BFDashboardsService", function(s) { return s.list(); } ]
        }
      });
    }])
    .controller( 'userPrefsCtrl', [ '$scope', 'BFUserPrefsService', 'bfFlash', function( $scope, service, FlashService ) {

        var $ctrl = this;

        $scope.model = {};

        $ctrl.mapProviders = libbf.GeoMap.getMapProviders();

        service.get().then(function(up) { $scope.model = up; });

        $ctrl.$onInit = function() {
            $ctrl.dashboards.sort(function(a,b) {
                return a.nsName === b.nsName ? a.name.localeCompare( b.name ) : a.nsName.localeCompare( b.nsName );
            });
        };
        $scope.submit = function () {
          service.set( $scope.model )
              .then(function(data) {
                  // flash a message to tell the user how it went
                  FlashService.success( "Save successful", 'flash-result' );
              }, function(response) {
                  FlashService.decodeResponse( response, "Save failed, reason: {}", 'flash-result' );
              });
        };
    }]);

  return module;
});

//48.599347, 7.791314
