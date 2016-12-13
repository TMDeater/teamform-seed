
var admin_ready = function(){

	$('#admin_ctlr').hide();
	var eventName = getURLParameter("evt");
	$('#evt_name').text("Event name: " + eventName);
	if(eventName == null || eventName.trim() == ""){
		$('#evt_name').text("Error: Invalid event name ");
	}

}


$(document).ready(admin_ready);


angular.module("teamform-admin-app", ["firebase", "ngMaterial", "ngMessages"])
.controller("AdminCtrl", function($scope, $firebaseObject, $firebaseArray, $window, $mdDialog) {

    // TODO: implementation of AdminCtrl
    // Initialize $scope.param as an empty JSON object
    $scope.param = {};
    // Call Firebase initialization code defined in site.js
    initializeFirebase();
    var refPath, ref, eventName;
    eventName = getURLParameter("event");
    if (eventName === null) {
        eventName = "test";
    }
    refPath = eventName + "/admin/param";
    ref = firebase.database().ref("events/" + refPath);
    // Link and sync a firebase object
    $scope.param = $firebaseObject(ref);
    $scope.paramMess="";
    $scope.paramLdMess=function(){
//  $scope.param.$loaded()
//      .then(function(data) {

            // Fill in some initial values when the DB entry doesn't exist
            if(typeof $scope.param.maxTeamSize == "undefined"){
                $scope.param.maxTeamSize = 10;
                $scope.paramMess+="NoMax "
            }
            if(typeof $scope.param.minTeamSize == "undefined"){
                $scope.param.minTeamSize = 1;
                $scope.paramMess+="NoMin "
            }

            // Enable the UI when the data is successfully loaded and synchornized
            $('#admin_page_controller').show();
        };
        $scope.param.$loaded().then($scope.paramLdMess);
    refPath = eventName + "/team";
    $scope.team = [];
    $scope.team = $firebaseArray(firebase.database().ref("events/" + refPath));
    refPath = eventName + "/member";
    $scope.member = [];
    $scope.member = $firebaseArray(firebase.database().ref("events/" + refPath));
    $scope.changeMinTeamSize = function(delta) {
        var newVal = $scope.param.minTeamSize + delta;
        if (newVal >= 1 && newVal <= $scope.param.maxTeamSize) {
            $scope.param.minTeamSize = newVal;
        }
        $scope.param.$save();
    };
    $scope.changeMaxTeamSize = function(delta) {
        var newVal = $scope.param.maxTeamSize + delta;
        if (newVal >= 1 && newVal >= $scope.param.minTeamSize) {
            $scope.param.maxTeamSize = newVal;
        }
        $scope.param.$save();
    };
    $scope.saveFunc = function() {
        $scope.param.$save();
        // Finally, go back to the front-end
        $window.open("main.html", "_self");
    };

    // Date
    $scope.sttD = new Date();
    $scope.edD = new Date();

    var evtAdminPRef = firebase.database().ref().child("events").child(eventName).child("admin").child("param");
    var evtAdminPObj = $firebaseObject(evtAdminPRef);
    evtAdminPObj.$loaded().then(function(admin) {
        $scope.sttD = new Date(admin.sttD);
        $scope.edD = new Date(admin.edD);
        $scope.description = admin.description;

        if (admin.sttD == null) {
			if (admin.sttD== null){
				$scope.sttD = new Date();
				$scope.edD = new Date();
			}
        }
        if (admin.description == null) {
            $scope.description = null;
        }
    });

    $scope.minD = new Date();
    $scope.sttChge = function() {
        $scope.minD = $scope.sttD;
    };

    $scope.saveContent = function() {
        if ($scope.details == null || $scope.startDate == null || $scope.endDate == null) {
            return;
        }

        ref.update({'startDate': $scope.sttD.getTime(), 'endDate': $scope.edD.getTime(),
            'details': $scope.details});
    };

    $scope.zeroMem = function(teamM) {
        if (teamM === undefined) {
            return true;
        }
        return false;
    };

})
.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('lime')
    .accentPalette('amber');
});
