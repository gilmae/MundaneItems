var config = require('./.config')

var verbs = require(config.corpora_location + 'data/words/verbs');
var adjectives = require(config.corpora_location + 'data/words/adjs.json');
var objects = require(config.corpora_location + 'data/objects/objects.json');

console.log();

var APIKEY = config.wordnik_api_key;

var verb = verbs.verbs[Math.floor(Math.random() * verbs["verbs"].length)].present;
var adjective = adjectives.adjs[Math.floor(Math.random() * adjectives.adjs.length)];
var object = objects.objects[Math.floor(Math.random() * objects.objects.length)];


var Client = require('node-rest-client').Client;

// Create a full configuration object
// See http://developer.wordnik.com/docs.html
var config = {
	hasDictionaryDef: false,
	relationshipTypes: "verb-form",
	api_key: APIKEY
};

  // Create a new Client object
  var client = new Client();

  // Start to build the URL
  var wordnikURL = 'http://api.wordnik.com/v4/word.json/' + verb + '/relatedWords?';

  // Parse the configuraiton object and create the request URL
  for(var option in config) {
  	wordnikURL = wordnikURL + "&" + option + "=" + config[option];
  }

  // Make sure we are asking for JSON
  var args = {headers: {'Accept':'application/json'}};
  // Create the GET request
  client.get(wordnikURL, args, function (data, response) {
    // Once the statusCode is 200, the response has been received with no problems
    if (response.statusCode === 200) {
      // Parse the JSON received as the response
      //return result.data;

      if (data.length > 0) {
        var words = data[0].words;

        var continuous_form = null;
        for (i=0, len = words.length; i < len; i++) {
          if (words[i].endsWith("ing")) {
            continuous_form = words[i];
          }
        }

        if (continuous_form){
          var toTitleCase = require('to-title-case');
          var words = [adjective, " ", object, " of ", continuous_form];
          console.log(toTitleCase(words.join("")));

        }
      }
    }
  });


// Finally, actually call the function with the configuration object
