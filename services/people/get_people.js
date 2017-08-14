var allNames = require("./names.json"),
    notNames = require("./notNames.json");
    notTerms = require("./terms.json");

var ignore = notNames.not_names,
    names = allNames.names,
    terms = notTerms.terms;

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

var checkWord = function(tWord){
    return (initialIsCapital(tWord) && !tWord.match(/\d+/g) && !ignore.includes(tWord) && tWord.length > 1 && (/[aeiou]/gi).test(tWord));
}

exports.get_people = function(text){
  return new Promise(function (resolve, reject) {
    var titles = ["Mr","Mrs","Miss","Ms","Dr","Professor","Prof","Lord","Lady"];
    var sentences = text.replace(/(?:\r\n|\r|\n)/g, '.').match(/\(?[^\.\?\!\:]+[\.!:\?]\)?/g);
    if(!sentences){
        sentences = [];    
    }
    var words = [];
    sentences.forEach(function(s,i) {
    words.push(s.split(/[\s/,;]+/)); 
    });

    var foundNames = [];
    words.forEach(function(w,i){
        w.forEach(function(x,y){
            if(initialIsCapital(x)){
                var tFound = titles.includes(x)
                if(!ignore.includes(x) && (names.includes(x) || tFound)){
                    var tName = (tFound ? [] : [x]);
                    var t=(tFound ? y+1 : y);
                    var found = true;
                    var tWord;
                    var nameTally = 0;
                    var nextWord;
                    while (found === true ) {
                        t++;
                       if(w[t]){
                            tWord = w[t].replace("'s",'').replace(/\W/g, '')
                            nextWord = w[t+1] || '';
                            found = checkWord(tWord);
                            // --------------------------------------------------------┤ If the next word is on the name list but this isn't the first word in the surname and the one after this is a valid word, let's plit them into a new name.
                            if(names.includes(tWord) && nameTally > 0 && checkWord(nextWord)){
                                found = false;
                            }
                            if(found){
                                tName.push(tWord)
                            };
                       }else{
                           found = false;
                       }
                        nameTally++;
                    }
                    if(tName.length > 1 && !terms.some(function(x){return tName.join(' ').includes(x);}))foundNames.push(tName.join(' '));
                };
            }
        })
    })
    return resolve(dedupe(foundNames))
  });
}

exports.checkNames = function(namesArr){
    return namesArr.filter(function(n){
        var tN = n.split(' ');
        return names.includes(tN[0]) 
        && !tN.some(function(x){
            return ignore.includes(x);
        })
        && !terms.some(function(x){
            return tN.join(' ').includes(x);
        })
    })
}