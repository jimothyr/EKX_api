exports.get_score = function(text){
  return new Promise(function (resolve, reject) {
  	text = stripNonPrintables(text);
  	var returnObj = {};
  	returnObj.sentences = getSentences([],text);
  	returnObj.wordCount = getWordCount(text);
  	returnObj.syllableCounts = syl_count(text);
  	returnObj.totalSyls = returnObj.syllableCounts.reduce(function(a, b) { return a + b; }, 0);
    returnObj.level = 206.835 - (1.015*(returnObj.wordCount / returnObj.sentences)) - (84.6*(returnObj.totalSyls / returnObj.wordCount));
    returnObj.equiv = (returnObj.level > 90 ? 0 : (returnObj.level > 70 ? 1 : 2));
    returnObj.engEquiv = (returnObj.level > 90 ? 'easy' : (returnObj.level > 70 ? 'medium' : 'hard'));
    returnObj.rag = (returnObj.level > 90 ? 'green' : (returnObj.level > 70 ? 'amber' : 'red'));
  	resolve(returnObj);
  }).catch((error) => {
      console.log('enls - ', error)
  })
}


function syl_count(sz){
	var syls_ar = [0];
	function syls(word) {
	  word = word.toLowerCase().trim();                               
	  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');  
	  word = word.replace(/^y/, '');        
	  var tCount = word.match(/[aeiouy]{1,2}/g);
	  if(tCount){
	  	if(syls_ar[tCount.length]){
	  		syls_ar[tCount.length]++;
	  	}else{
	  		syls_ar[tCount.length] = 1;
	  	}
	  }
	  // return (word.match(/[aeiouy]{1,2}/g) ? word.match(/[aeiouy]{1,2}/g).length : 0);                   
	};
	var words = sz.replace(/([ .,;!?:]+)/g,'$1�sep�').split('�sep�');
	for(var i=0;i<words.length;i++){
		syls(words[i]);
	}

	return syls_ar;
}

function stripNonPrintables(sz){
var len,i;
var szNew="";
len=sz.length;
for(i=0;i<len;i++)
  {
  if(sz.charCodeAt(i)<32 || (sz.charCodeAt(i)>127 && sz.charCodeAt(i)!=8216 && sz.charCodeAt(i)!=8217 && sz.charCodeAt(i)!=8220 && sz.charCodeAt(i)!=8221 && sz.charCodeAt(i)!=8364 && sz.charCodeAt(i)!=163) )  // &lsquo;, &rsquo; &ldquo; &rdquo; &euro; and &pound; symbols respectively.
    {
    //sz=sz.substring(0,i) + " " + sz.substring(i+1,len);
    //alert(sz.charAt(i) + " " + sz.charCodeAt(i));
    if(szNew.charAt(szNew.length-1)!=" ")szNew=szNew + " ";  //Only add a space character if not one there already.
    }
  else if(sz.charAt(i)==" " && szNew.charAt(szNew.length-1)==" ");  //Don't add redundant spaces.
  else if(sz.charAt(i)=="<")szNew=szNew + "&lt;";  //Any tag brackets in the string will have come from the text of the page, not from any tags. Need to convert back to &; format.
  else if(sz.charAt(i)==">")szNew=szNew + "&gt;"; 
  else if(sz.charCodeAt(i)==8216)szNew=szNew + "&lsquo;";
  else if(sz.charCodeAt(i)==8217)szNew=szNew + "&rsquo;";
  else if(sz.charCodeAt(i)==8220)szNew=szNew + "&ldquo;";
  else if(sz.charCodeAt(i)==8221)szNew=szNew + "&rdquo;";  
  else if(sz.charCodeAt(i)==8364)szNew=szNew + "&euro;";  
  else if(sz.charCodeAt(i)==163)szNew=szNew + "&pound;";

  else if(sz.charAt(i)=="&")szNew=szNew + "&amp;"; 
  else szNew=szNew + sz.charAt(i);
  }

return szNew;
}

function isCapital(c){
if(c>='A' && c<='Z') return true;
else return false;
}

function isSentenceEnd(sz, n) // examines the text in string sz, around the full stop at position n.
{
var bAns=true;
var len;

len=sz.length;

if (n<len) // we're not off the end of the string..yet (some tests below may be...first test condition(s) in own brackets is the check on this.)
  {
  if(sz.charAt(n)!="." && sz.charAt(n)!="!" && sz.charAt(n)!="?" && sz.charAt(n)!="\'" && sz.charAt(n)!="\"" && sz.charAt(n)!=";")bAns=false; // ';' as quotes could end in &rsquo; etc. and be a sentence end.
  else
    {
	if((n+1<len) && sz.charAt(n+1)!=" ")bAns=false;	
    //if((n+2<len) && (sz.charAt(n+1)!=" ")  && (sz.charAt(n+2)!=" ") && (sz.charAt(n+1)!="\'")  && (sz.charAt(n+1)!="\"") ) bAns=false; // ! must be followed by a space to be valid. 
   // else if((n+1<len) && sz.charAt(n)=="?" && sz.charAt(n+1)!=" ")bAns=false; // ? must be followed by a space to be valid.
//if(sz.charCodeAt(n)==8217)alert("8217");
    else if((n>0) && (sz.charAt(n)=="\'" || sz.charAt(n)=="\"") && sz.charAt(n-1)!="." &&  sz.charAt(n-1)!="!" &&  sz.charAt(n-1)!="?") bAns=false;
	else if(sz.charAt(n)==";")  //Check for full stop etc before &; type closing quote characters..
	  {
      if(!((sz.substring(n-6,n+1)=="&rsquo;" || sz.substring(n-6,n+1)=="&rdquo;") && (sz.charAt(n-7)=="." || sz.charAt(n-7)=="!" ||  sz.charAt(n-7)=="?"))) bAns=false;
	  }
    else if((n+2<len) && sz.substring(n-2,n+2)=="... " &&  !isCapital(sz.charAt(n+2)))bAns=false;  // the end of a series of ..... but not followed by a capital letter so not a sentence end.

    else if((n+1<len) && (sz.charAt(n+1)=="." || sz.charAt(n+1)=="!" || sz.charAt(n+1)=="?")) bAns=false;   // one of a series of ..... or ....! or ....?, only the last one marks the end of the sentence.

    else if( ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()==" i.e. ") )         //One will always expect ie to be followed by text in the same sentence, so no need to check for following capital letter.
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()==" i.e. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()==" ie. ") )
	  ||     ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()=="(i.e. ") )          //Check for brackets....
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()=="(i.e. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()=="(ie. ") ))
      {
      bAns=false;
      //alert(sz.substring(n-1,n+3) + " " + bAns);
      }

    else if( ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()==" e.g. ") )       //One will always expect eg to be followed by text in the same sentence, so no need to check for following capital letter.
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()==" e.g. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()==" eg. ") )
	  ||     ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()=="(e.g. ") )        //Check for brackets....
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()=="(e.g. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()=="(eg. ") ))
      {
      bAns=false;
      //alert(sz.substring(n-1,n+3) + " " + bAns);
      }

   else if( ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()==" n.b. ") )       //One will always expect nb to be followed by text in the same sentence, so no need to check for following capital letter.
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()==" n.b. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()==" nb. ") )
	  ||     ( (n+4<len) && (sz.substring(n-2,n+4).toLowerCase()=="(n.b. ") )       //Check for brackets....
      ||     ( (n+2<len) && (sz.substring(n-4,n+2).toLowerCase()=="(n.b. ") )
      ||     ( (n+2<len) && (sz.substring(n-3,n+2).toLowerCase()=="(nb. ") ))
      {
      bAns=false;
      //alert(sz.substring(n-1,n+3) + " " + bAns);
      }

    else if((n+2<len) && sz.substring(n-4,n+1)==" etc." && !isCapital(sz.charAt(n+2)) )bAns=false;  //Not a sentence end unless followed by a capital letter.

    else if((n+2<len) && sz.substring(n-3,n+1)==" pm." && !isCapital(sz.charAt(n+2)) )bAns=false;
    else if((n+2<len) && sz.substring(n-3,n+1)==" am." && !isCapital(sz.charAt(n+2)) )bAns=false;
    else if((n+2<len) && sz.substring(n-3,n+1)==" St." && !isCapital(sz.charAt(n+2)) )bAns=false;
    else if((n+2<len) && sz.substring(n-3,n+1)==" Rd." && !isCapital(sz.charAt(n+2)) )bAns=false;
    else if((n+2<len) && sz.substring(n-3,n+1)==" Co." && !isCapital(sz.charAt(n+2)) )bAns=false;
    else if((n+1<len) && sz.charAt(n+1)>="0" && sz.charAt(n+1)<="9")bAns=false; // It's a decimal point not a full stop.
    }
  }
return bAns;
}


function getWordCount(sz){
var i, len, iCnt=0;
var bChar=false, bCharOld=false;
var c;

len=sz.length;
for(i=0;i<len;i++)
  {
  c=sz.charAt(i);//alert(c);//sz.substring(i,i+1);
  //if(c=="." || c=="!" || c=="?" || c==":" || c=="," || c==";" || c=="(" || c==")" || c=="/" || c=="\\" || c=="'"); //Do nothing
  if( (c>="a" && c<="z") || (c>="A" && c<="Z") || (c>="0" && c<="9") ||( c=="-") ||( c=="+") || (c=="&") ||(c=="%"))bChar=true;
  else if(c==" ")bChar=false;
  else ; // do nothing as other characters will be punctuation etc that should not affect bChar state.
  //alert(c+" " + bChar);
  if( (bChar==true) && (bCharOld==false) )iCnt++;
  bCharOld=bChar;
  }

return iCnt;
// return 0;
}


function getSentences(aSentences, sz){
var i=0, iBegin=0, len;
var szAlert="";

len=sz.length;

for(i=0;i<len;i++)
  {
  if(isSentenceEnd(sz,i))
    {
    if (sz.substring(iBegin,i+1).indexOf("IGNORETHISSENTENCE!!")==-1) //Check we don't need to ignore this sentence
      {
      aSentences[aSentences.length]=sz.substring(iBegin,i+1); 
      }
    iBegin=i+1;
    }
  }
szAlert=len + " characters extracted from page for analysis.\n" + aSentences.length + " sentences found.";
if(iBegin<sz.length) // The extracted text from the page does not end with a complete sentence , some text is left over...
  {
  if(getWordCount(sz.substring(iBegin))>0)
    {
	szAlert=szAlert + "\n\nWARNING: extracted text does not end in a complete sentence. It ends with the following sentence fragment, which will not be included in the analysis:\n" + sz.substring(iBegin);
	if(szAlert.length>300)szAlert=szAlert.substr(0,296) + "..."; // Truncate any long fragments.
	}
  }
// console.log(szAlert);  
return aSentences.length;
}