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

                InstallationsService.search({objectId: personId,relType:REL_TYPE_INSTALLATION,timestamp:(new Date()).toISOString()}).then(function(installs){
                    if(installs.length!=0){
                        if(confirm(window.alert('This tag is already associated to a person, association will be removed. Continue?'))){
                        var inst = installations[0];
                        inst.endVt = (new Date()).toISOString();
                        InstallationsService.persist( inst ).then(function resolve( ) {
                            $scope.attachTag(tagId,subjectId);
    
                        }, function reject ( errOrResponse ) {
                            var message = decodeHTTPResponse(errOrResponse );
                            console.log( message );
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
            InstallationsService.search({ subjectId: tagId, relType: REL_TYPE_INSTALLATION,timestamp: (new Date()).toISOString()}).then(function (installations) { // timestamp: (new Date()).toISOString()}
            function install() {
                InstallationsService.search({ objectId: personId, subjectId: tagId, relType: REL_TYPE_INSTALLATION}).then(function(installations){
                     if(installations!=0){
                         installations[0].endVt=(new Date()).toISOString();
                         InstallationsService.persist(installations);
                     }
                     else{}
                 })
                 InstallationsService.persist({
                        id: null,
                        subject:    tagId,
                        object:     personId,
                        relType: REL_TYPE_INSTALLATION,
                        startVt:    (new Date()).toISOString(),
                        endVt: 'infinity',

                    })
                        .then(function resolve() {
                            window.alert($ctrl.you + ' and ' + personId + ' were correctly associated!');
                            $scope.success=true;
                            $scope.state=!$scope.state;

                        },
                            function reject(errOrResponse) {
                                var message = decodeHTTPResponse(errOrResponse);
                                console.log(message);
                                window.alert('The tag is already associated, check association or try with another tag');

                            });
                        }
               




                if (installations.length > 1) {
                    // what to do here?
                    return;
                }
                if (installations.length === 1) {
                    //if (confirm('This beacon was already paired to someone, the association has been removed')) {
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
                    $scope.temp={};
                    $scope.size=1;
                }
            }
            })
            };

        $ctrl.ChromSamplesInit = function(){
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
                  msgValue = ADDR.substring(0,ADDR.indexOf(','));
                  BFSubjects.search({ name: msgValue,typeSid: 'butachimie-tag' }).then(function( subjects ) {
                    $scope.temp.beacon=subjects.length===1?subjects[0].id:null;
                    $scope.size=Object.keys($scope.temp).length;
                    document.getElementById("displayNum").innerHTML=('Checking for the following tag: '+msgValue);
                    window.alert('You scanned: '+subjects[0].name);
                    })
                break;
                  }
                            catch(e){
                                window.alert(e);
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
                        window.alert('You are '+ $ctrl.you);
                        document.getElementById("displayNum").innerHTML=('Checking for the following tag: '+msgValue);
                    })
                       break;
                       
                     }
                     }
                    //Serialcheck(msgValue);
                    };
                    
              

        };
        $ctrl.unpairing = function (){
            const REL_TYPE_INSTALLATION = 11;
            const decodeHTTPResponse= libbf.functions.decodeHTTPResponse;
            $scope.unpaired=!$scope.unpaired;
            var reader = new NDEFReader();
            reader.scan();
                    reader.onreading =({message,serialNumber}) =>{
                        let msgValue;
                        for (const record of message.records) {
                            console.log(`> Record type:   ${record.recordType}`);
                             switch(record.recordType){
                                case "text":
        window.alert('Error: You scanned a tag, please scan an identification badge');
        break;
                          default:
                               msgValue=String(serialNumber);
                               BFSubjects.search({typeSid:'butachimie-person', rules: [
                                { path: '{serialNo}', pred: '~*', val:msgValue }
                            ] }).then(function( subjects ) {
                                let tag=subjects.length === 1 ?subjects[0].id : null;
                                let you=subjects[0].name;
                                window.alert('You are unpairing the "'+ you+'" tag.');
                                const today=(new Date()).toISOString();
                                InstallationsService.search({relType:REL_TYPE_INSTALLATION}).then(function(installations){//relType: 11,timestamp:today,subjectId: tag
                                    if(installations!=0){
                                    var inst=installations[0];
                                    inst.endVt=(new Date()).toISOString();
                                    InstallationsService.persist(inst).then(function resolve(){
                                        window.alert('Unpairing process was succesfull!');
                                        $scope.unpaired=!$scope.unpaired;
                                    })
                                    }
                                    else{
                                        window.alert('Person is not paired to a beacon');
                                    }
                                })
                            })
                               break;
                               
                             }
                             }
        
                    }
        
        };

        $scope.fun = function () {
            $scope.state = !$scope.state;
        };

        $scope.$on('$destroy', function() {
           

        });
$ctrl.beacon;
$ctrl.tag;
    }]);//the end
});
