var summaryTool = require('./summ');
exports.get_summary = function(text){
	return new Promise(function (resolve, reject) {
		summaryTool.summarize(text, function(summary, err) {
			return resolve(summary);
		})
	}).catch((error) => {
    	console.log('summary error - ', error)
	    return reject(error);
    })
}