var fs = require('fs');
exports.bounce = function(strings){
	fs.writeFile(process.env.OPENSHIFT_DATA_DIR+'Bounce/bounces.json', ','+ JSON.stringify(strings),  {'flag':'a'},  function(err) {
		if(err){
			console.log('bounce error :' ,err)
		}
	});
}