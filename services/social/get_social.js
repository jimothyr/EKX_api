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

exports.get_twitter = function(keywords){
	return new Promise(function (resolve, reject) {
		request({
			url: "https://api.twitter.com/1.1/search/tweets.json?list:EnergySysCat/energy-knowledge-exchange&q="+encodeURIComponent(keywords),
			method: "GET",
			gzip: true,
			json: true,   // <--Very important!!!
			auth: {
				'Bearer': 'AAAAAAAAAAAAAAAAAAAAACpEUwAAAAAAKh1ygUUTNmZv%2BOzK1etjVww4n%2Fk%3D7WJt0PdN6lDjurwlliPxNYnd6l3zNp4A5hwoZMA1K9EImULmfC'
			}
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