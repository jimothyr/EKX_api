var allNames = require("./names.json");

function initialIsCapital( word ){
    if(!word) return false;
    if(!word[0]) return false;
    return word[0] !== word[0].toLowerCase();
}

function dedupe(arr) {
    return arr.reduce(function (p, c) {

        // create an identifying id from the object values
        var id = c;

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
    var names = allNames.names;
    var titles = ["Mr","Mrs","Miss","Ms","Dr","Professor","Prof","Lord","Lady"];
    var sentences = text.replace(/(?:\r\n|\r|\n)/g, '.').match(/\(?[^\.\?\!\:]+[\.!:\?]\)?/g);
    if(sentence.length == 0){
        sentences = [];    
    }
    var words = [];
    sentences.forEach(function(s,i) {
    words.push(s.split(' ')); 
    });

    var foundNames = [];

    words.forEach(function(w,i){
        w.forEach(function(x,y){
            if(initialIsCapital(x)){
                var tFound = titles.includes(x)
                if(names.includes(x) || tFound ){
                    var tName = (tFound ? [] : [x]);
                    var t=(tFound ? y+1 : y);
                    var found = true;
                    while (found === true) {
                        t++;
                        found = initialIsCapital(w[t])
                        if(found){tName.push(w[t].replace("'s",'').replace(/\W/g, ''))};
                    }
                    if(tName.length > 1)foundNames.push(tName.join(' '));
                };
            }
        })
    })
    return resolve(dedupe(foundNames))
  });
}