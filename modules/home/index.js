define([ 'require', ], function ( require ) {
    'use strict';

    return angular.module("app.home", [ 'ui.router' ])
      //.component('homeComp', { templateUrl:  'modules/home/template.html', controller: 'homeCtrl' })
      .config(['$stateProvider', function($stateProvider) {
          $stateProvider.state( {
              name:        'home',
              url:         '/home',
              controllerAs: "$ctrl",
              controller:  'homeCtrl',
              templateUrl: require.toUrl('./template.html')
          });
      }])
      .controller('homeCtrl', [ "$scope", "$element", 'BFUserPrefsService', function ( $scope, $element, userPrefs ) {

        var $ctrl = this;
        function list (ev) {

            $scope.$apply( function() {
                $scope.state = !$scope.state;
            });
        }
        function errorFun(){
            console.log('Something went wrong somewhere');
             
        }

        $ctrl.$onInit = function () {

            window.addEventListener('resize', list);
            $ctrl.ChromSamplesInit();
            window.addEventListener('error', errorFun());

        };

        $ctrl.ChromSamplesInit = function(){
            $scope.scopefun();
            $ctrl.ChromeSamples = {
            
                setStatus: function(status) {
                  document.querySelector('#status').textContent = status;
                },
            
                setContent: function(newContent) {
                  var content = document.querySelector('#content');
                  while(content.hasChildNodes()) {
                    content.removeChild(content.lastChild);
                  }
                  content.appendChild(newContent);
                }
                
              };
            //   if (/Chrome\/(\d+\.\d+.\d+.\d+)/.test(navigator.userAgent)){
            //     if (81 > parseInt(RegExp.$1)) {
            //       ChromeSamples.setStatus('Warning! Keep in mind this sample has been tested with Chrome ' + 81 + '.');
            //     }
            //   }
            
        }
        $scope.scopefun = function () {
            $scope.state = false;
        };

        $ctrl.fun = function () {
            $scope.state = !$scope.state;
        };

        $scope.$on('$destroy', function() {
            window.removeEventListener('resize', list);

        });

    }]);
});
