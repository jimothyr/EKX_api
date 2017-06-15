var request = require('request');
var appGlobals = require('../globals/globals.json');

exports.getEvents = function(organiser){
	return new Promise(function (resolve, reject) {
		request({
		    url: 'https://www.eventbriteapi.com/v3/organizers/'+organiser+'/events/?order_by=start_desc&only_public=on&token='+appGlobals.eventbriteKey,
		    method: "GET",
		    json: true,   // <--Very important!!
		}, function (error, response, body){
			if(error){
				return reject(error);
			}else if(!body.events){
				return resolve([]);
			}else{
				return resolve(body.events);
			}
		});
	}).catch((error) => {
        console.log('events - ', error)
		return reject(error);
    })
}