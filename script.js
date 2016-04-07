// global variables
var words, play, done = false, wrong = 0;

// get words from words.txt
$.ajax({
  url: "words.txt",
  dataType: "text",
  method: "get"
}).success(function(data) {
  // split words by line
  words = data.split("\n");
  // remove extra array elements (extra line break)
  for(var j = 0; j < words.length; j++) {
    if(words[j] == undefined || words[j] == "")
      words.splice(j, 1);
    else if(words[j].indexOf(" or ") > -1) {
      var matches = /^(.+) or (.+)$/.exec(words[j]);
      words[j] = [matches[1], matches[2]];
    }
  }
  // shuffle the words
  // algorithm adapted from http://bost.ocks.org/mike/shuffle/
  var m = words.length, t, i;
  while(m) {
    i = Math.floor(Math.random() * m--);
    t = words[m];
    words[m] = words[i];
    words[i] = t;
  }
  console.log(words);
}).error(function(err) {
  // if error, log it
  console.log(err);
});

// on document load
$(function() {
  // elements
  var button = $("button#check");
  var input = $("input#word");
  input.focus();
  var replay = $("button#replay");
  var completed = $("div#completed");
  // on <ENTER> or button click, check word
  // on <CTRL>+<ENTER>, speak
  // mutli-key logic adapted from http://stackoverflow.com/a/12444641/2397327
  var map = [];
  var checkKeys = function(event) {
    map[event.which] = event.type == "keydown";
    if(event.type == "keyup")
      return;
    if(map[13] && map[17])
      play();
    else if(map[13])
      button.click();
  };
  input.keydown(checkKeys);
  input.keyup(checkKeys);
  // loop through words
  var i = 0;
  button.click(function() {
    if(done)
      return;
    var check = false;
    if(typeof words[i] == "string")
      check = words[i] == input.val();
    else
      check = words[i][0] == input.val() || words[i][1] == input.val();
    if(check) {
      input.val("");
      var wikilink = "https://en.wiktionary.org/wiki/";
      completed.prepend("<div onclick='window.open(\"" + wikilink + (typeof words[i] == "string" ? words[i] : words[i][0]).replace(/ /g, "_") + "\", \"_blank\")' class='completedWord wrong" + (wrong >= 6 ? 6 : wrong) + "' title='" + wrong + " time" + (wrong == 1 ? "" : "s") + " wrong'>" + words[i] + "</div>");
      wrong = 0;
      if(++i == words.length) {
        done = true;
        completed.prepend("<div class='completedWord doneWord' onclick='window.print()'>Print?</div>");
        return;
      }
      play();
      // reset input
      var hasClass = input.hasClass("hideText");
      input.removeClass();
      input.replaceWith(input.clone(true));
      input = $("input#word");
      input.addClass("right");
      if(hasClass)
        input.addClass("hideText");
      input.focus(function() {
        this.value = this.value;
      });
      input.focus();
    } else {
      // if it's empty, not wrong
      if(input.val() == "")
        return;
      // add to wrong counter
      wrong++;
      // reset input
      var hasClass = input.hasClass("hideText");
      input.removeClass();
      input.replaceWith(input.clone(true));
      input = $("input#word");
      input.addClass("wrong");
      if(hasClass)
        input.addClass("hideText");
      input.focus(function() {
        this.value = this.value;
      });
      // if wrong too many times, show hint
      if(wrong >= 6)
        alert(words[i]);
      // focus input
      input.focus();
    }
  });
  // add hide function
  $("div#hide").click(function() {
    input.toggleClass("hideText");
  });
  // function to play word
  play = function() {
    // set up the speaker
    var stringVoice = "US English Female";
    var voiceOptions = {
      volume: 1,
      rate: 0.75 + Math.random()/2,
      range: 0.5 + Math.random()
    };
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.voice = voices[10];
    msg.voiceURI = "native";
    msg.volume = 1;
    msg.rate = 0.75;
    msg.pitch = 1;
    msg.text = typeof words[i] == "string" ? words[i] : words[i][0];
    msg.lang = "en-US";
    window.speechSynthesis.speak(msg);
  };
  replay.click(play);
});
