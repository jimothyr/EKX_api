var search      = require('../search/elasticsearch'),
    appGlobals 	= require('../globals/globals.json');

exports.get_data = function(keywords){
    return new Promise(function (resolve, reject) {
        search.getRelated(keywords, null, appGlobals.dataShard)
        .then(function(ret_related){
            console.log(ret_related)
            return resolve(ret_related)
        }).catch((error) => {
            console.log('related - ', error)
            return reject(error);
        });
    })
}