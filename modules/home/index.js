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
      .controller('homeCtrl', [ "$scope", "$element", 'BFUserPrefsService','BFAuthService','BFInstallationsService','BFSubjectsService','$q', function ( $scope, $element, userPrefs,BFauth, InstallationsService,BFSubjects,q) {

        var $ctrl = this; 
        function errorFun(){
            console.log('Something went wrong somewhere');
             
        }
        var commitAssoc= function(tagId,personId){
                const REL_TYPE_INSTALLATION = 11;
                const decodeHTTPResponse= libbf.functions.decodeHTTPResponse;

                InstallationsService.search({objectId: personId,relType:'is-installed-at',timestamp:(new Date()).toISOString()}).then(function(installs){
                    if(installs.length===1){
                        if(confirm('This person is already associated with another tag, association will be removed. Continue?')){
                        var inst = installs[0];
                        inst.endVt = (new Date()).toISOString();
                        InstallationsService.persist( inst ).then(function resolve( ) {
                            $scope.attachTag(tagId,personId);
    
                        }, function reject ( errOrResponse ) {
                            var message = decodeHTTPResponse(errOrResponse );
                            console.log('Not working: '+ message );
                        });

                    }
                }
                else{
                    $scope.attachTag(tagId,personId);
                }
            });


   
   
                    
                 //})

                }
        //}
        $scope.attachTag= function(tagId,personId){
            const REL_TYPE_INSTALLATION = 11;
            const decodeHTTPResponse= libbf.functions.decodeHTTPResponse;
            InstallationsService.search({ subjectId: tagId, relType:'is-installed-at',timestamp: (new Date()).toISOString()}).then(function (installations) { // timestamp: (new Date()).toISOString()}
            function install() {
                 InstallationsService.persist({
                        id: null,
                        subject:    tagId,
                        object:     personId,
                        relType: REL_TYPE_INSTALLATION,
                        startVt:    (new Date()).toISOString(),
                        endVt: 'infinity',

                    })
                        .then(function resolve() {
                            console.log($ctrl.you + ' and ' + personId + ' were correctly associated!');
                            $scope.success=true;
                            $scope.state=!$scope.state;
                            delete $scope.temp.beacon;
                            delete $scope.temp.tag;
                            $scope.size=0;

                        },
                            function reject(errOrResponse) {
                                var message = decodeHTTPResponse(errOrResponse);
                                console.log(message);
                                console.log('There was an error while associating, please try again');

                            });
                            //}
                        // })
                        }
               




                if (installations.length > 1) {
                    console.log('> Critical error: This tag is associated to more than one person!')
                    console.log(installations);
                    if(installations[0].endVt<(new Date()).toISOString()){
                        install();
                    }
                    return;
                }
                if (installations.length === 1) {
                        console.log('This tag is already paired with someone else, association will be removed');
                        var inst = installations[0];
                        inst.endVt = (new Date()).toISOString();
                        InstallationsService.persist(inst).then(function resolve() {
                            install();

                        }, function reject(errOrResponse) {
                            var message = decodeHTTPResponse(errOrResponse);
                            console.log(message);
                        });
                    //}
                }
                else {
                    install();
                }



            
        });
    }
        $ctrl.$onInit = function () {
            document.documentElement.webkitRequestFullScreen();
            $scope.hideValue=true;
            $ctrl.ChromSamplesInit();
            window.addEventListener('error', errorFun());
            console.log('Beta version 2.35/troubleshooting');
            $scope.success=false;
            // $scope.unpaired=!$scope.unpaired;



            try{
                BFauth.authenticate('admin','D3fAulT-P4ssW0rD',null,'https://beta.orisun-iot.com/');
        
            }
            catch(e){
                console.log(e);
            }
            $scope.$watch('size',function(){
                if($scope.temp){
                if($scope.size===2){
                    commitAssoc($scope.temp.beacon,$scope.temp.tag);
                }
            }
            })
            };

        $ctrl.ChromSamplesInit = function(){
            $scope.success=false;
            $scope.temp={};
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

function changeScopeState(){
$scope.state=!$scope.state;
}

        $ctrl.scanStart = function () {
            document.getElementById("tag_of_person").innerHTML='';
            document.getElementById("name_of_person").innerHTML='';
            document.getElementById(unpairStatus).innerHTML='';
            changeScopeState();   
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
                  msgValue = ADDR.substring(0,ADDR.indexOf(','));
                  BFSubjects.search({ name: msgValue,typeSid: 'butachimie-tag' }).then(function( subjects ) {
                    $scope.temp.beacon=subjects.length===1?subjects[0].id:null;
                    $scope.size=Object.keys($scope.temp).length;
                    document.getElementById("tag_of_person").innerHTML=('TagId: '+subjects[0].name);
                    console.log('You scanned: '+subjects[0].name);
                    $scope.hideValue=false;
                    })
                break;
                  }
                            catch(error){
                                console.log(error);
                                console.log('tag reading error');
                                break;
                            }
                  default:
                       msgValue=String(serialNumber);
                       BFSubjects.search({typeSid:'butachimie-person', rules: [
                        { path: '{serialNo}', pred: '~*', val:msgValue }
                    ] }).then(function( subjects ) {
                        $scope.temp.tag=subjects.length === 1 ?subjects[0].id : null;
                        $scope.size=Object.keys($scope.temp).length;
                        $ctrl.you=subjects[0].name;
                        console.log('You are '+ $ctrl.you);
                        document.getElementById("name_of_person").innerHTML=($ctrl.you);
                        $scope.hideValue=false;
                    })
                       break;
                       
                     }
                     }
                    };
                    

        };
        $ctrl.unpair = function(){
            let tag =$scope.temp.tag;
            let beacon =$scope.temp.beacon;

            if(confirm('Are you sure you want to unpair? ')){
                document.getElementById(unpairStatus).innerHTML='Unpair successful';
                $scope.hideValue=true;
                $scope.attachTag(tag,beacon)
            }
        }
$ctrl.beacon;
$ctrl.tag;
    }]);//the end
});
