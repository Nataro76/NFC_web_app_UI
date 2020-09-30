define([ 'require', 'libbf', './module' ], function (require, libbf, module) {

    const i18n = libbf.i18n;

  module
    .component('aboutComp', {
        bindings: { about: '<' },
        templateUrl: require.toUrl('./template.html'),
        controllerAs: 'abtCtrl',
        controller: [ '$scope', function($scope) {
            this.$onInit = function() {
                $scope.about = this.about;
                $scope.about.title = i18n.gettext( 'Skeleton App' );
                $scope.about.subhead = i18n.gettext( 'Orisun Big Family' );
                $scope.about.logo = '/resources/logos/orisun-logo-name.120.png';
            };
        }]
    })
    .config([ '$stateProvider', function($stateProvider) {
      $stateProvider.state({
        name: 'about',
        url: '/about',
        component: 'aboutComp',
        resolve: {
          about: ['AboutService', function(AboutService) {
            return AboutService.getInfo();
          }]
        }
      });
    }]);

  return module;
});

