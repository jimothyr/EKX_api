var keyword_extractor = require("keyword-extractor");

exports.get_keywords = function(text){
	return new Promise(function (resolve, reject) {
		return resolve(keyword_extractor.extract(text,{
            language:"english",
            remove_digits: true,
            return_changed_case:true,
            remove_duplicates: true
       }));
	}).catch((error) => {
	    console.log('get Keywords - ', error)
		return reject(error);
	})
}