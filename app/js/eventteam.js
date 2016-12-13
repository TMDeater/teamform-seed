/**
 * parse the team firebaseObject to a JavaScript array
 *
 * @param teamObj team firebaseObject
 * @return team JavaScript array
 */
function prseTms(tmObj, usrObj) {
    var teams = [];

    angular.forEach(tmObj, function(val, ky) {
        var c = ky.charAt(0);
        if (c !== "_" && c !== "$" && c !== ".") {
            teams.push({
                name: key,
                size: val.size,
                currentTeamSize: val.currentTeamSize,
                skills: val.skills,
                teamMembers: val.teamMembers,
                teamSkills: val.teamSkills,
                skillsMatch: (usrObj !== null) ? isMatched(val.skills, usrObj.skills) : null
            });
        }
    });
    return teams;
}

angular.module("teamform-eventteam-app", ["firebase", "ngMaterial"])
.controller("EventTeamCtrl", function($scope, $firebaseObject, $firebaseArray, $mdDialog) {
    initializeFirebase();


    $scope.eventName = getURLParameter("event");
    if ($scope.eventName === null) {
        $scope.eventName = "test";
    }

    var eventRef=firebase.database().ref().child("events").child($scope.eventName);
    /* teams */
    var teamRef = firebase.database().ref().child("events").child($scope.eventName).child("team");
    var teamObj = null;


    $scope.user = null;

    var userRef = null;
    $scope.userObj = null;

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

                $scope.userObj.$loaded().then(function(user) {
                    teamObj = $firebaseObject(teamRef);
                    teamObj.$loaded().then(function(teams) {
                        $scope.teams = prseTms(teams, $scope.userObj);
                        $scope.dbTeams = angular.copy($scope.teams);
                    });
                });
            });
        } else {
            // No user is signed in.
            console.log('no user is signed in');

            // refresh the scope
            $scope.$apply(function() {
                $scope.user = null;

                userRef = null;
                $scope.userObj = null;

                teamObj = $firebaseObject(teamRef);
                teamObj.$loaded().then(function(teams) {
                    $scope.teams = parseTeams(teams, $scope.userObj);
                    $scope.dbTeams = angular.copy($scope.teams);
                });
            });
        }
    });


    var eventAdminParamRef = firebase.database().ref().child("events").child($scope.eventName).child("admin").child("param");
    var eventAdminParamObj = $firebaseObject(eventAdminParamRef);
    eventAdminParamObj.$loaded().then(function(admin) {
        $scope.minTeamSize = admin.minTeamSize;$scope.maxTeamSize = admin.maxTeamSize;$scope.sttD = admin.sttD;$scope.edD = admin.edD;
        $scope.description = admin.description;
    });


    /* filter and sort toggle */
    // bind variables
    $scope.fPlacesSwh = false;
    $scope.fSkillsSwh = false;
    $scope.stPlacesSwh = false;
    $scope.stSkillsMatchSwh = false;

    // filter teams that still have places left
    $scope.filterPlaces = function(teams) {
        return getAvailTeam(teams);
    };

    // filter teams that match the signed in user skills
    $scope.fSkillsMatch = function(teams) {
        return teams.filter(function(team) 
			{return team.skillsMatch.number > 0;});
    };

    // filter the teams
    $scope.fTeams = function(filterPlacesSwitch, filterSkillsMatchSwitch) {
        var teams = angular.copy($scope.dbTeams);

        if (fPlacesSwh) {
            teams = $scope.fPlaces(teams);
        }

        if (fSkillsMatchSwh) {
            teams = $scope.fSkillsMatch(teams);
        }

        $scope.teams = angular.copy(teams);
    };

    // sort teams by the number of places left
    $scope.sortPlaces = function(teams) {
        return teams.sort(function(a, b) {
            var x = a["size"]-a["currentTeamSize"]; var y = b["size"]-b["currentTeamSize"];
            if (x>y) return 1;
			if (x<y) return -1;
			else 	 return 0;
        });
    };

    // sort teams by skills matched
    $scope.stSkillsMatch = function(teams) {


        return teams.sort(function(a, b) {
            var x = a.skillsMatch.number; var y = b.skillsMatch.number;
			if (y>x) return 1;
			if (y<x) return -1;
			else 	 return 0;
        });
    };

    // sort the teams
    $scope.stTeams = function(sortBy) {
        if (sortBy === "places") {
            $scope.stSkillsMatchSwh = false;
        } else if (sortBy === "skillsMatch") {
            $scope.stPlacesSwh = false;
        }

        var teams = angular.copy($scope.teams);

        if ($scope.stPlacesSwh) {
            teams = $scope.stPlaces(teams);
        } else if ($scope.stSkillsMatchSwh) {
            teams = $scope.stSkillsMatch(teams);
        }

        $scope.teams = angular.copy(teams);
    };


    // create new team function
    $scope.createTeam = function() {

                var inputteam = prompt("Enter New Team Name");
                var newTeamRef = teamRef.child(inputteam);
                newTeamRef.set({size: parseInt(($scope.minTeamSize + $scope.maxTeamSize) / 2), currentTeamSize: 0});
                
        window.alert("team created");
        location.reload();

    };


    // request team function
 $scope.requestTeam = function(teamName) {
        //alert("test)")
        var eventMemberTeamRef = firebase.database().ref().child("events").child($scope.eventName).child("member").child($scope.user.uid).child("selection");
        var userEventRef = firebase.database().ref().child("users").child($scope.user.uid).child("events").child($scope.eventName).child("selection");
        var eventMemberTeamArray = $firebaseArray(eventMemberTeamRef);

        var teamreqlist = eventRef.child("team").child(teamName).child("request");
        var teamreqarrary = $firebaseArray(teamreqlist);
//window.alert("run");
        // teamreqarrary.$loaded().then(function(requestss){
        //     var req=[];
        //     window.alert("run");
        //     requestss.forEach(function(request){
        //         req.push(request.$value);
        //     });
        //     if (!req.includes($scope.user.uid)) {
        //         req.push({id: $scope.user.uid.$value, name: $scope.user.name.$value});
        //     }
        //     teamreqlist.set(req);
        // });

        eventMemberTeamArray.$loaded().then(function(selections) {
            var req = [];
//window.alert("test2")
            // add the selections stored in the database
            selections.forEach(function(selection) {
                req.push(selection.$value);
            });

            // add the request team if it was not in the database
            if (!req.includes(teamName)) {
                req.push(teamName);
            }
//window.alert("test3");
            // update the record in the event
            eventMemberTeamRef.set(req);
//window.alert("test4");
//            firebase.database().ref().child("events").child($scope.eventName).child("member").child($scope.user.uid).update({name: user.displayName});
//window.alert("test5");
            // update the record in the user's profile
            userEventRef.set(req);

            window.alert("Team Requested")
            window.open("main.html","_self");
        });
    };
})
.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('dark')
    .primaryPalette('orange')
    .accentPalette('indigo');
});
