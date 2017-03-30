var toTitleCase = require('to-title-case');
var Client = require('node-rest-client').Client;
var Twit = require('twit');
var corpora = require('corpora-project');
var pluralize = require('pluralize')

var config = require('./.config')

var verbs = require(config.corpora_location + 'data/words/verbs');
var adjectives = require(config.corpora_location + 'data/words/adjs.json');
var objects = require(config.corpora_location + 'data/objects/objects.json');
var appliances = require(config.corpora_location + 'data/technology/appliances.json');
var animals = require(config.corpora_location + 'data/animals/common.json');
var personal_nouns = require(config.corpora_location + 'data/words/personal_nouns.json');
var nouns = require(config.corpora_location + 'data/words/nouns.json');
var clothes = require(config.corpora_location + 'data/objects/clothing.json');

var firstNames = require(config.corpora_location + 'data/humans/firstNames.json');
var lastNames = require(config.corpora_location + 'data/humans/lastNames.json');

var honorifics = require(config.corpora_location + 'data/humans/englishHonorifics.json');
var occupations = require(config.corpora_location + 'data/humans/occupations.json');

var creatures_with_adjectives = require(config.corpora_location + 'data/animals/collateral_adjectives.json');
var creatureJobs = honorifics.englishHonorifics.concat(occupations.occupations);

var items = objects.objects.concat(appliances.appliances);
var actions = personal_nouns.personalNouns.filter(function(word){return word.endsWith("er");})
var traits = nouns.nouns.filter(function(word){return word.endsWith("ity") || word.endsWith("ness");})


var WORDNIK_APIKEY = config.wordnik_api_key;

function getContinuousForm(word) {

	return new Promise(function(resolve, reject) {
		// Create a full configuration object
		// See http://developer.wordnik.com/docs.html
		var config = {
			hasDictionaryDef: false,
			relationshipTypes: "verb-form",
			api_key: WORDNIK_APIKEY
		};

		// Create a new Client object
		var client = new Client();

		// Start to build the URL
		var wordnikURL = 'http://api.wordnik.com/v4/word.json/' + word + '/relatedWords?';

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
	            resolve(words[i]);
							return;
	          }
	        }
				}
			}
			reject();
		}
	);
	}
)};

function write(words) {
	T.post('statuses/update', { status: toTitleCase(words.join("")) }, function(err, data, response) {
	  console.log(data)
	});
}

function writeToConsole(words) {
	  console.log(toTitleCase(words.join("")))
}

function getAdjective() {
	return new Promise(function(resolve, reject){
		resolve(
			adjectives.adjs[Math.floor(Math.random() * adjectives.adjs.length)]
		)
	})
}

function getVerb() {
	return new Promise(function(resolve, reject){
		resolve(
			verbs.verbs[Math.floor(Math.random() * verbs.verbs.length)].present
		)
	})
}

function getNoun() {
	return new Promise(function(resolve, reject){
		resolve(
			nouns.nouns[Math.floor(Math.random() * nouns.nouns.length)]
		)
	})
}

function getContiuingVerb() {
	return new Promise (function(resolve, reject) {
		resolve(getVerb().then(getContinuousForm).catch(getContiuingVerb));
	});
}

function getObject() {
	return new Promise(function(resolve, reject){
		resolve(items[Math.floor(Math.random() * items.length)])
	})
}

function getClothing() {
	return new Promise(function(resolve, reject){
		resolve(clothes.clothes[Math.floor(Math.random() * clothes.clothes.length)])
	})
}

function getAction() {
	return new Promise(function(resolve, reject){
		resolve(actions[Math.floor(Math.random() * actions.length)])
	})
}

function getTrait() {
	return new Promise(function(resolve, reject){
		resolve(traits[Math.floor(Math.random() * traits.length)])
	})
}

function getMonster() {
	return new Promise(function(resolve, reject){
		resolve(animals.animals[Math.floor(Math.random() * animals.animals.length)])
	})
}

function getAnimalCollateralAdjective() {
	return new Promise(function(resolve, reject){
		var animal = creatures_with_adjectives.animals[Math.floor(Math.random() * creatures_with_adjectives.animals.length)];
    var adjs = animal.collateral_adjectives;
		resolve(adjs[Math.floor(Math.random() * adjs.length)]);
	})
}

function getFirstName() {
	return new Promise(function(resolve, reject){
		resolve(firstNames.firstNames[Math.floor(Math.random() * firstNames.firstNames.length)])
	})
}

function getLastName() {
	return new Promise(function(resolve, reject){
		resolve(lastNames.lastNames[Math.floor(Math.random() * lastNames.lastNames.length)])
	})
}

function getJob() {
	return new Promise(function(resolve, reject){
		resolve(creatureJobs[Math.floor(Math.random() * creatureJobs.length)])
	})
}

function getPlural(word) {
	return new Promise(function(resolve, reject){
		resolve(pluralize.plural(word))
	})
}

function getString(string) {
	return new Promise(function(resolve, reject){
		resolve(string);
	})
}

function build(promises) {
	Promise.all(promises).then(function(words){
    write(words);
	})
}

function adjectiveObjectOfVerbing() {
	build([getAdjective(), getString(" "), getObject(), getString(" of "), getContiuingVerb()]);
}

function objectOfVerbingMonsters() {
	build([getObject(), getString(" of "), getContiuingVerb(), getString(" "), getMonster(), getString("s")]);
}

function objectOfMonsterTrait() {
	build([getObject(), getString(" of "), getMonster(), getString(" "), getTrait()]);
}

function objectOfAdjectiveVerbing() {
	build([getObject(), getString(" of "), getAdjective(), getString(" "), getContiuingVerb()]);
}

function objectOfVerbingAndVerbing() {
	build([getObject(), getString(" of "), getContiuingVerb(), getString(" and "), getContiuingVerb()]);
}

function objectPlusBonus() {
	build([getObject(), getString(" +" ), getString(Math.floor(Math.random()*5)+1)]);
}

function objectPlusBonusAction() {
	build([getObject(), getString(" +" ), getString(Math.floor(Math.random()*5+1)), getString(", "), getAction()]);
}

function clothingOfTheMonster() {
	build([getClothing(), getString(" of the "), getMonster()]);
}

function objectOfName(){
	var elements = [getObject(), getString(" of "), getFirstName()];
	if (Math.random() > .66) {
		elements = elements.concat([getString(" "), getLastName()])
	}

	build(elements);
}

function objectOfCreatureJobs() {
	build([getObject(), getString(" of the "), getAnimalCollateralAdjective(), getString(" "), getJob().then(getPlural)])
}



var endullments = [objectOfMonsterTrait,
	objectOfVerbingMonsters,
	adjectiveObjectOfVerbing,
	objectOfAdjectiveVerbing,
	objectOfVerbingAndVerbing,
	objectPlusBonus,
	objectPlusBonusAction,
	clothingOfTheMonster,
	objectOfName,
	objectOfCreatureJobs
]

var T = new Twit(config.twitter);

function rollUpItem() {
	var which = Math.floor(Math.random()*endullments.length);
	endullments[which]();
}

rollUpItem();
setInterval(rollUpItem, 1000 * 60 * 60);
