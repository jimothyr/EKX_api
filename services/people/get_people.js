var nlp = require('compromise');

function dedupe(arr) {
  return arr.reduce(function (p, c) {

    // create an identifying id from the object values
    var id = c.normal;

    // if the id is not found in the temp array
    // add the object to the output array
    // and add the key to the temp array
    if (p.temp.indexOf(id) === -1) {
      p.out.push(c);
      p.temp.push(id);
    }
    return p;

  // return the deduped array
  }, { temp: [], out: [] }).out;
}

exports.get_people = function(text){
	return new Promise(function (resolve, reject) {
		var ret_people = nlp(text).people().data();
		ret_people = dedupe(ret_people);
		return resolve(
			ret_people.filter(function (el) {
				return el.genderGuess !== null && el.firstname !== null && el.firstname !== null && el.firstname !== '' && el.firstname !== '' ;
			})
		);
	}).catch((error) => {
      console.log('people - ', error)
      return reject(error);
  });
}