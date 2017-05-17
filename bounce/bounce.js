var fs = require('fs');
exports.bounce = function(fUrl, tUrl, userHash){
	fs.writeFile(process.env.OPENSHIFT_DATA_DIR+'Bounce/bounces.csv', userHash+','+fUrl+','+tUrl+','+ new Date()+'\n',  {'flag':'a'},  function(err) {
		if(err){
			console.log('bounce error :' ,err)
		}
	});
}