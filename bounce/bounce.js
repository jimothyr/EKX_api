var fs = require('fs');
exports.bounce = function(fUrl, tUrl, tDate, userHash){
	fs.writeFile(process.env.OPENSHIFT_DATA_DIR+'Bounce/bounces.csv', userHash+','+fUrl+','+tUrl+','+tDate+','+ new Date()+'\n',  {'flag':'a'},  function(err) {
		if(err){
			console.log('bounce error :' ,err)
		}
	});
}