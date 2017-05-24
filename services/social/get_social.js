var request = require('request');
exports.get_stackExchange = function(keywords){
	return new Promise(function (resolve, reject) {
		request({
			url: "https://api.stackexchange.com/2.2/similar?pagesize=10&order=desc&sort=relevance&title="+encodeURIComponent(keywords)+"&site=sustainability",
			method: "GET",
			gzip: true,
			json: true,   // <--Very important!!!
		}, function (error, response, body){
			if(error){
				return reject(error);
			}
			if(body){
				return resolve(body)
			}else{
			   return resolve([]);
			}
		});
	})
}