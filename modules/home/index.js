define([ 'require','libbf'], function ( require, libbf ) {
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
      .controller('homeCtrl', [ "$scope", "$element", 'BFUserPrefsService','BFAuthService','BFInstallationsService','BFSubjectsService','$q', function ( $scope, $element, userPrefs,BFauth, BFInstallation,BFSubjects,q) {

        var $ctrl = this; 
        function errorFun(){
            console.log('Something went wrong somewhere');
             
        }

        $ctrl.$onInit = function () {
            $ctrl.ChromSamplesInit();
            window.addEventListener('error', errorFun());
            console.log('Beta version 1.53/network testing');
            try{
                BFauth.authenticate('admin','D3fAulT-P4ssW0rD',null,'https://beta.orisun-iot.com/');
        
            }
            catch(e){
                console.log(e);
            }
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
            // { signal: controller.signal }  
            reader.scan();
            reader.onreading =({message,serialNumber}) =>{
                let ADDR
                let msgValue;
                console.log('message: ' + message);
                console.log('Serial Number: ' + serialNumber);
                for (const record of message.records) {
                    console.log(`> Record type:   ${record.recordType}`);
                     switch(record.recordType){
                        case "text":
                            try{
                  console.assert(record.recordType === "text");
                  const textDecoder = new TextDecoder(record.encoding);
                  ADDR = String(`Text: ${textDecoder.decode(record.data)} (${record.lang})`);
                  ADDR = String(ADDR.match(/(\d+)/));
                  msgValue = ADDR.substr(0,7);
                  //msgValue=msgValue.substr(0,7);
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
                     }
                    Serialcheck(msgValue);
                    };
                    
              

        };

        $scope.fun = function () {
            $scope.state = !$scope.state;
        };

        $scope.$on('$destroy', function() {
           

        });
//here all the function that were used as a class
function Serialcheck(serial){
let tagValue=String(serial);
document.getElementById("displayNum").innerHTML=('Checking for the following tag: '+tagValue);
dbCheck(tagValue);
}
$ctrl.beacon;
$ctrl.tag;
function dbCheck(tagADDR){
    const REL_TYPE_INSTALLATION = 11;
    const decodeHTTPResponse= libbf.functions.decodeHTTPResponse;
    let serialNo=null;;
    const $q=q;
    let tagString=String(tagADDR);
    if(tagString.match(/(\d+)/).length!=tagADDR.length){
        serialNo=tagADDR;
    }
    else{
        tagADDR=parseInt(tagADDR);
    }
    

        $q.all(
            BFSubjects.search({ name: tagADDR,typeSid: 'butachimie-tag' }).then(function( subjects ) {
                $ctrl.beacon=subjects.length===1?subjects[0].id:null;
                return $ctrl.beacon;
            }),

            BFSubjects.search({ subjectTypeSid:'butachimie-person', rules: [
                { path: '{serialNo}', pred: 'eq', value:serialNo }
            ] }).then(function( subjects ) {
                window.alert( subjects.length === 1 ?subjects[0].id : null );
                return ( subjects.length === 1 ?subjects[0].id : null );
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
    }]);//the end
});
