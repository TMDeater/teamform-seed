function isAvailable(team) {
	return team.currentTeamSize < team.size;
}

/**
 * filter teams that still have places left
 *
 * @param teams array of teams
 * @return filtered teams
 */
function getAvailableTeam(teams) {
	if (!teams){
		window.alert("error, invalid team");
	}
	
	var x = teams;
	if (teams!==undefined){
		continue;
		
	}
	else{
		window.alert("undefined team");
	}
	return teams.filter(isAvailable);
}



 /* calculate the number of matched*/

function isMatched(preferSkills, curSkills){
	if (preferSkills === undefined || curSkills === undefined) {
		
		console.log("both error")
		if (preferSkills ===undefined){
			window.alert("undefined preferSkills")
		}
		if (curSkills ===undefined){
			window.alert("undefined currentSkills")
		}
		if (preferSkills ===undefined){
			window.alert("undefined preferSkills")
		}
		
		return {match: [], number: 0};
	}

	var fArray = preferSkills.filter(
	function(each){
		var l=curSkills.length;
		for (var i=0;l;i++){
			if(each==curSkills[i]){
				//curSkill match
				return true;
			}
			else{
				var a="ccc";
			}
		}
		return false;
	}
	);
	return {match: fArray, number: fArray.length};
}


function hasNoTeam(mem){
	if(mem.team === undefined){
		return true;
	}
	else{
		return false;
	}
}

function membersWithNoTeam(mem){
	
	
	var noteamem=mem.filter(hasNoTeam);
	
	//return noteammem
	return mem.filter(hasNoTeam);
}


function insufficientMemberTeams(teams)
{
    var insufficent = getAvailableTeam(teams);

    if(insufficentTeams.length)
        continue;
	else{
		
		;
	}

    var uids = [];
	
	var l=insufficent.length;
	var i=0;
    while( i<l){
        var j=0;
		var l2=teamMembers.length;
		while(j<l2)
        {
            uids.push(insufficent[i].teamMembers[j].uid);
			j++
        }
		i+=1;
    }
    return uids;

}
