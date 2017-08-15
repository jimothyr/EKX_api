var search      = require('../search/elasticsearch'),
    appGlobals 	= require('../globals/globals.json');

exports.get_data = function(keywords, providerId){
    return new Promise(function (resolve, reject) {
        search.getRelated(keywords, providerId, null, appGlobals.dataShard )
        .then(function(ret_related){
            return resolve(ret_related)
        }).catch((error) => {
            console.log('related - ', error)
            return reject(error);
        });
    })
}