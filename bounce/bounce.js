var fs = require('fs');
exports.bounce = function(strings){
	fs.writeFile(process.env.OPENSHIFT_DATA_DIR+'Bounce/bounces.txt', JSON.stringify(strings)+'\n',  {'flag':'a'},  function(err) {
		if(err){
			console.log('bounce error :' ,err)
		}
	});
}