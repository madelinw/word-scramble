function Scrambler() {
  var API_KEY,
      word,
      getWord;

  API_KEY = "80dd0819727ea436a27020fb7ee060d58f98dbfd4d9c22770";

  this.wordAPI = "http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=true&excludePartOfSpeech=proper-noun&minCorpusCount=10000&maxCorpusCount=-1&minDictionaryCount=10&maxDictionaryCount=-1&minLength=4&maxLength=6&limit=10&api_key=" + API_KEY;
  this.words = [];
  this.points = 0;
  this.scrambledArray = [];
  this.unscrambledArray = [];
  this.dict = {};
}

Scrambler.prototype.getCurrentWord = function(words) {
  return words[this.points];
}

Scrambler.prototype.explodeWord = function(word) {
  var characters,
      getWord;

  getWord = [word.toLowerCase()].shift() + "";
  characters = getWord.split('');

  return characters;
}

Scrambler.prototype.generateWords = function() {
  var self = this,
      words = [];

  $.ajax({
    url: self.wordAPI,
    dataType: 'json',
    async: false,
    success: function(data) {
      _.each(data, function(i) {
        self.words.push(i.word)
      });
    },
    error: function(xhr, status, err) {
      self.words = ["sandbox", "cupcake", "cheese"]
      console.error(url, status, err.toString());
    }
  })
  return self.words;
}

Scrambler.prototype.play = function(words) {
  var word,
      characters;

  if (! words) {
    words = this.generateWords();
  }

  this.words = words;
  word = this.getCurrentWord(words)
  this.characters = this.explodeWord(word)

  this.scramble(this.characters);
  this.mapCharactersToCodes();
  this.addToDom();
  this.bindEvents();
}

// Get a random word, scramble the letters
Scrambler.prototype.scramble = function(arr) {
  var newArr = arr.slice(0);
  while (newArr.length > 0) {
    var randomNumber = Math.floor(Math.random() * newArr.length);
    this.scrambledArray.push(newArr.splice(randomNumber,1)[0]);
  }
}

// Build a dictionary of character codes
Scrambler.prototype.mapCharactersToCodes = function() {
  this.dict = {};
  for (var i=0; i < this.scrambledArray.length; i++) {
    var charCode = this.scrambledArray[i].charCodeAt(0)
    if (_.has(this.dict, charCode)) {
      this.dict[charCode] += 1
    } else {
      this.dict[charCode] = 1
    }
  }
}

// Add letters to DOM
Scrambler.prototype.addToDom = function() {
  for (var i=0; i < this.scrambledArray.length; i++) {
    var charCode = this.scrambledArray[i].charCodeAt(0)
    $(".scrambled").append("<span class=letter-" + charCode + "-" + this.dict[charCode] + ">" + this.scrambledArray[i] + "</span>");
    this.dict[charCode] -=1
  }
}

// Reset & go to the next word
Scrambler.prototype.reset = function() {
  $(".unscrambled").children().remove();
  $(".scrambled").children().remove();

  this.unscrambledArray = [];
  this.scrambledArray = [];
  $("body").unbind("keypress");
}

// On keyup, move letter to new "unscrambled" container
Scrambler.prototype.bindEvents = function() {
  var self = this;

  this.mapCharactersToCodes();

  $("body").keypress(function(e) {

    // If character is in letter & hasn't already been typed
    // Move typed character into unscrambled wrapper
    if ((_.has(self.dict, e.which)) && (self.dict[e.which] > 0)) {

      $(".letter-" + e.which + "-" + self.dict[e.which]).appendTo(".unscrambled")
      self.unscrambledArray.push(String.fromCharCode(e.which));
      self.dict[e.which] -= 1;

    }

    // When unscrambled container reaches length of word
    if (self.unscrambledArray.length == self.characters.length)

      // if it matches... success! start over.
      if (_.isEqual(self.unscrambledArray, self.characters)) {

        setTimeout(function() {
          self.points += 1;
          $(".points").html(self.points);
          console.log("wooh!")
          console.log("points: " + self.points)

          self.reset();
          self.play(this.words);
        }, 500)

      } else {

        // if it doesnt... clear! start over.
        $(".unscrambled").addClass("fail");

        setTimeout(function() {
          $(".unscrambled").removeClass("fail");
          $(".unscrambled").children().appendTo(".scrambled");
          self.unscrambledArray = [];
          self.mapCharactersToCodes();
          console.log("try again")
        }, 1000)

      }
  })
}

$(document).ready(function() {

  scrambler = new Scrambler();
  scrambler.play();

})
