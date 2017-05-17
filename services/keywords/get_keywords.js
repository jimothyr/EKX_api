var retext = require('retext');
var keywords = require('retext-keywords');
var nlcstToString = require('nlcst-to-string');

exports.get_keywords = function(text){
	// return new Promise(function (resolve, reject) {
	// 	retext().use(keywords, {maximum:100}).process(text, function(err, file){
	// 		if(err){
	// 			return reject(err);
	// 		}

	// 		var retKeys = [];
	// 		file.data.keyphrases.forEach(function (phrase) {
	// 			phrase.sort = phrase.score*phrase.weight;
	// 			if(phrase.score > 0.015){
	// 		    	retKeys.push({term: phrase.matches[0].nodes.map(nlcstToString).join('').toLowerCase(), score: phrase.score, weight: phrase.weight, sort: phrase.sort});
	// 			}
	// 	    });
		    
	// 		retKeys.sort(function compare(a,b) {
	// 		  if (a.sort > b.sort)
	// 		    return -1;
	// 		  if (a.sort < b.sort)
	// 		    return 1;
	// 		  return 0;
	// 		});
	// 	    return resolve(retKeys);
	// 	})
	// }).catch((error) => {
	//     console.log('get Keywords - ', error)
	// 	return reject(error);
	// })
}