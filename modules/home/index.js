define([ 'require',], function ( require ) {
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
      .controller('homeCtrl', [ "$scope", "$element", 'BFUserPrefsService','BFAuthService','BFInstallationsService', function ( $scope, $element, userPrefs,BFauth, BFInstall) {

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
              if (/Chrome\/(\d+\.\d+.\d+.\d+)/.test(navigator.userAgent)){
                if (81 > parseInt(RegExp.$1)) {
                  ChromeSamples.setStatus('Warning! Keep in mind this sample has been tested with Chrome ' + 81 + '.');
                }
              }
            
        }
        $ctrl.scanStart = function () {
//             window.alert('version 1.1');
            $scope.state = !$scope.state;    
            const reader = new NDEFReader();   
            reader.scan();
            reader.onreading = ({message,serialNumber}) =>{
                let ADDR
                let msgValue;
                console.log('message: ' + message);
                console.log('Serial Number: ' + serialNumber);
                for (const record of message.records) {
                    window.alert(`> Record type:   ${record.recordType}`);
                     switch(record.recordType){
                        case "text":
                            try{
                  console.assert(record.recordType === "text");
                  const textDecoder = new TextDecoder(record.encoding);
                  ADDR = `Text: ${textDecoder.decode(record.data)} (${record.lang})`;
                  msgValue = msgValue.match(/(\d+)/);
                  break;
                  }
                            catch(e){
                                window.alert(e);
                                break;
                            }
                  default:
                       msgValue=serialNumber;
                       break;
                       
                     }
                     window.alert('You scanned the '+ msgValue+' tag.');
                    }
                    
            }                                                                                
        };

        $ctrl.fun = function () {
            $scope.state = !$scope.state;
        };

        $scope.$on('$destroy', function() {
            window.removeEventListener('resize', list);

        });
//here all the function that were used as a class
function Serialcheck(serial){
let tagValue=String(serial);
dbCheck(tagValue);
}

function dbCheck(tagADDR){
    const REL_TYPE_INSTALLATION = 11;
    const decodeHTTPResponse = libbf.function.decodeHTTPResponse;

        $q.all(
            BFSubjects.search({ name: tagADDR,subjectTypeSid: 'butachimie-tag' }).then(function( subjects ) {
                return ( subjects.length === 1 ?subjects[0].id : null );
            }),

            BFSubjects.search({ subjectTypeSid:'butachimie-person', rules: [
                { path: '{serialNo}', pred: 'eq', value:serialNo }
            ] }).then(function( subjects ) {
                return ( subjects.length === 1 ?
subjects[0].id : null );
            })

        ).then(function ( data ) {
            var tagId = data[0];
            var personId = data[1];
            // check if
            // BFInstallationsService
            BFInstallation.search({ subjId: tagId, relType:
REL_TYPE_INSTALLATION }).then(function(installations) {

                function install ( ) {
                    BFInstallation.persist({
                        subject:    tagId,
                        object:     personId,
                        relType: REL_TYPE_INSTALLATION,
                        startVt:    (new Date()).toISOString(),

                    }).then( function resolve( ) {
                        // nothing to do

                    }, function reject ( errOrResponse ) {
                        var message = decodeHTTPResponse(
errOrResponse );
                        log.error( message );
                    });
                }

                if ( installations.length > 1 ) {
                    // what to do here?
                    return;
                }
                if ( installations.length === 1 ) {
                    var inst = installations[0];
                    inst.endVt = (new Date()).toISOString();
                    BFInstallation.persist( inst ).then(
function resolve( ) {
                        install();

                    }, function reject ( errOrResponse ) {
                        var message = decodeHTTPResponse(
errOrResponse );
                        log.error( message );
                    });
                } else {
                    install();
                }

            })

        });
}
    }]);
});
