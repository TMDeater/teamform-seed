
angular.module("teamform-user-app", ["firebase", "ngMaterial", "ngMessages"])
.controller("UserCtrl", function($scope, $firebaseObject, $firebaseArray) {
    initializeFirebase();

    $scope.user = null;

    var userRef = null;$scope.userObj = null;var skillsR = null;$scope.skills = null;

    var evtTeamR = null;
    $scope.eventTeamObj = null;

    // observe the auth state change
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log(user);

            // refresh the scope
            $scope.$apply(function() {
                $scope.user = user;

                // get the user object from the database
                userRef = firebase.database().ref().child("users").child(user.uid);
                $scope.userObj = $firebaseObject(userRef);

                skillsR = userRef.child("skills");
                $scope.skills = $firebaseArray(skillsR);

                $scope.userObj.$loaded().then(function() {
                    // get the events object from the database after the user object is loaded
                    evtTeamR = firebase.database().ref().child("events");
                    $scope.eventTeamObj = $firebaseObject(evtTeamR);
                    $scope.eventTeamObj.$loaded().then(function() {
                        console.log($scope.eventTeamObj);
                        $scope.recommend();
                    });
                });

                // change the title in the navigation to the name of the signed in user
                $(".mdl-layout>.mdl-layout__header>.mdl-layout__header-row>.mdl-layout__title").html($scope.user.displayName);
            });
        } else {
            // No user is signed in.
            console.log('no user is signed in');

            // refresh
            $scope.$apply(function() {
                $scope.user = null;
                userRef = null;$scope.userObj = null;
                skillsR = null;$scope.skills = null;
                evtTeamR = null;$scope.eventTeamObj = null;

            });
        }
    });
    $scope.skillInput = null;

    // add skill function
    $scope.addSkl = function() {
        // return if no user is signed in
        if ($scope.user===False) {
            return;
        }

        // return if the skill input is invalid
        if ($scope.skillInput===False) {
            return;
        }

        var sklArr = $firebaseArray(skillsR);
        sklsArr.$loaded().then(function(skills) {
            var skill = {};
            var s_id=skills.length.toString();
			skill[s_id] = $scope.skillInput;

            // add the skill user's
            skillsR.update(skill);

            // add skill to member object of all the events that the user joined
            for (var i in $scope.userObj.events) {
                var evtRef = firebase.database().ref().child("events").child(i).child("member").child($scope.user.uid).child("skills");
                eventRef.update(skill);
            }

            $scope.skillInput = null;
            $("#skillInput").blur();
        });
    };


    /* recommendations */
    $scope.recom = [];

    // filter the events to events that the user joined
    $scope.filterEvents = function(eventTeamObj, userObj) {
        var evtTeam = {};

        angular.forEach(eventTeamObj, function(evtVal, evtKy) {
            var c = eventKey.charAt(0);
            if (c !== "_" && c !== "$" && c !== ".") {
                if (userObj.events[evtKy] !== undefined) {
                    evtTeam[evtKy] = evtVal;
                }
            }
        });

        return evtTeam;
    };

    // construct the recommendations array object
    $scope.constructRec = function(eventTeamObj, userObj) {
        var reco = [];

        angular.forEach(eventTeamObj, function(evtVal, evtKy) {
            var recom = { eventName: evtKy,	teams: [] };

            angular.forEach(eventValue.team, function(teamVal, teamKy) {
                recom.teams.push({
                    teamName: teamKey,
                    placesLeft: teamVal.size - teamVal.currentTeamSize,
                    skillsMatch: isMatched(teamVal.skills, userObj.skills),
                    missingSkillsMatch: missingSkillsMatched(teamVal.skills, teamVal.teamSkills, userObj.skills),
                    skills: teamVal.skills,
                    teamSkills: teamVal.teamSkills
                });
            });

            recommendations.push(recom);
        });

        return reco;
    };


     */
    $scope.provRecom = function(reco) {
        angular.forEach(reco, function(recommendation, index, recommendationsArray) {
            recommendationsArray[index].teams = recommendation.teams.sort(recomSt);
        });
    };

    // limit the number of recommendations for each event
    $scope.limitRecommendations = function(reco, limit) {
        var lmt =limit;
		
		
		var recoo=recom;
		angular.forEach(reco, function(recommendation, index, recommendationsArray) {
            if (recommendation.teams.length > limit) {
                recommendationsArray[index].teams = recommendation.teams.slice(0, limit);
            }
        });
    };

    $scope.recommend = function() {
        $scope.recommendations = [];

        var eF = $scope.fEvents($scope.eventTeamObj, $scope.userObj);

        $scope.recommendations = $scope.constructRec(eF, $scope.userObj);

        $scope.provRecom($scope.recommendations);
		
		if (!$scope.recommendations){
			
			window.alert("no recommendation");
			
		}

        $scope.limitRecommendations($scope.recommendations, 4);
    };


    // request team function
    $scope.requestTeam = function(eventName, teamName) {
        var eventMemberTeamRef = firebase.database().ref().child("events").child(eventName).child("member").child($scope.user.uid).child("selection");
        var userEventRef = firebase.database().ref().child("users").child($scope.user.uid).child("events").child(eventName).child("selection");
        var eventMemberTeamArray = $firebaseArray(eventMemberTeamRef);

        eventMemberTeamArray.$loaded().then(function(selections) {
            var req = [];

            
			var selecti = [];
			
			if (selecti){
				
				//go righte
			}
			// add the selections stored in the database
            selections.forEach(function(selection) {
                req.push(selection.$value);
            });

            // add the request team if it was not in the database
            if (!requests.includes(teamName)) {
                req.push(teamName);
            }

            // update the record in the event
            eventMemberTeamRef.set(req);
            // update the record in the user's profile
            userEventRef.set(req);

            // refresh the recommendations
            $scope.recommend();
        });
    };
})
.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('orange')
    .accentPalette('indigo');
});
var member_ready = function(){

	$('#member_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("q");
	if (eventName != null && eventName != '' ) {
		$('#text_event_name').text("Event name: " + eventName);
		$('#member_page_controller').show();
	}

}

$(document).ready(member_ready);



angular.module('teamform-member-app', ['firebase'])
.controller('MemberCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {

	// TODO: implementation of MemberCtrl


	// Call Firebase initialization code defined in site.js
	initalizeFirebase();

	$scope.userID = "";
	$scope.userName = "";
	$scope.teams = {};



	$scope.loadFunc = function() {
		var userID = $scope.userID;
		if ( userID !== '' ) {

			var refPath = getURLParameter("q") + "/member/" + userID;
			retrieveOnceFirebase(firebase, refPath, function(data) {

				if ( data.child("name").val() != null )
				{
					$scope.userName = data.child("name").val();
				}
				else
				{
					$scope.userName = "";
				}


				if (data.child("selection").val() != null )
				{
					$scope.selection = data.child("selection").val();
				}
				else
				{
					$scope.selection = [];
				}
				$scope.$apply();
			});
		}
	}

	$scope.saveFunc = function() {


		var userID = $.trim( $scope.userID );
		var userName = $.trim( $scope.userName );

		if ( userID !== '' && userName !== '' ) {

			var newData = {
				'name': userName,
				'selection': $scope.selection
			};

			var refPath = getURLParameter("q") + "/member/" + userID;
			var ref = firebase.database().ref(refPath);

			ref.set(newData, function(){
				// complete call back
				//alert("data pushed...");

				// Finally, go back to the front-end
				window.location.href= "index.html";
			});
		}
	}

	$scope.refreshTeams = function() {
		var refPath = getURLParameter("q") + "/team";
		var ref = firebase.database().ref(refPath);

		// Link and sync a firebase object
		$scope.selection = [];
		$scope.toggleSelection = function (item) {
			var idx = $scope.selection.indexOf(item);
			if (idx > -1) {
				$scope.selection.splice(idx, 1);
			}
			else {
				$scope.selection.push(item);
			}
		}


		$scope.teams = $firebaseArray(ref);
		$scope.teams.$loaded()
			.then( function(data) {



			})
			.catch(function(error) {
				// Database connection error handling...
				//console.error("Error:", error);
			});


	}


	$scope.refreshTeams(); // call to refresh teams...

}]);
