var keyword = require("gramophone");

exports.get_keywords = function(text){
	return new Promise(function (resolve, reject) {
		return resolve(keyword.extract(text, {score: true, stopwords : ['energy'], limit : 10}));
	}).catch((error) => {
	    console.log('get Keywords - ', error)
		return reject(error);
	})
}