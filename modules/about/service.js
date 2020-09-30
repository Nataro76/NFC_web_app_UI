define([ './module' ], function (module) {

  module.service('AboutService', [ '$http', 'APP_URL', function($http, APP_URL) {
    var service = {
      getInfo: function() {
        // return $http.get( APP_URL + '/about', { cache: true }).then(function(resp) {
        //   return resp.data;
        // });
        return {version:'1'};
      }
    };
    return service;
  }]);
  return module;
});

