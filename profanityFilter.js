// Thanks to Kano Computing for profanity list. https://raw.githubusercontent.com/KanoComputing/nodejs-profanity-util/

var profanity = {
    badWords: [],

    clean: function(string) {
        while (profanity.badWords == []) {}

        var input = string.split(" ");
        var returns = "";

        for (var i = 0; i < input.length; i++) {
            if ($.inArray(input[i].toLowerCase().replace(/[.,\/\\|¦¬@#!£$€%\^&\*;:{}+=\-_'"`~()\[\]\<\>]/g,""), profanity.badWords) > -1) {
                returns += Array(input[i].length + 1).join("*") + " ";
            } else {
                returns += input[i] + " ";
            }
        }

        return returns.substring(0, returns.length - 1);
    },

    isRude: function(string) {
        while (profanity.badWords == []) {}

        var input = string.split(" ");
        var returns = false;

        for (var i = 0; i < input.length; i++) {
            if ($.inArray(input[i].toLowerCase().replace(/[.,\/\\|¦¬@#!£$€%\^&\*;:{}+=\-_'"`~()\[\]\<\>]/g,""), profanity.badWords) > -1) {
                returns = true;
            }
        }

        return returns;
    }
}

$.getJSON("https://raw.githubusercontent.com/KanoComputing/nodejs-profanity-util/master/lib/swearwords.json", function(data) {
    profanity.badWords = data;
});