function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

var lang = {
    defaultLang: "en-GB",
    realLang: "en-GB",
    lang: "en-GB",
    list: {},
    translog: [],
    translogErrors: [],
    sentWarning: false,

    translate: function(string, replacements = [], useLocaleFormats = true) {
        if (!lang.translog.includes(string) && string != "%") {
            lang.translog.push(string);
        }

        if (typeof(replacements) == "string" || replacements instanceof Date) {
            replacements = [replacements];
        } else if (typeof(replacements) == "number") {
            replacements = [String(replacements)];
        }

        if (lang.lang != lang.defaultLang && lang.list[lang.lang] != undefined) {
            if (lang.list[lang.lang][string]) {
                if (typeof(lang.list[lang.lang][string]) == "object") {
                    if (String(replacements[0]) == "1") {
                        string = lang.list[lang.lang][string]["sing"];
                    } else {
                        string = lang.list[lang.lang][string]["pl"];
                    }
                } else {
                    string = lang.list[lang.lang][string];
                }
            } else {
                if (!lang.translogErrors.includes(string) && string != "%") {
                    lang.translogErrors.push(string);
                }
            }
        } else {
            if (lang.lang != lang.defaultLang && lang.list[lang.lang] == undefined && !lang.sentWarning) {
                lang.sentWarning = true;

                if (getURLParameter("languageWarningMessage") != null) {
                    alert(getURLParameter("languageWarningMessage"));
                } else {
                    alert("Sorry! The language that you chose is unavailable.");
                }
            }

            if (lang.list["overrides"][string]) {
                if (typeof(lang.list["overrides"][string]) == "object") {
                    if (String(replacements[0]) == "1") {
                        string = lang.list["overrides"][string]["sing"];
                    } else {
                        string = lang.list["overrides"][string]["pl"];
                    }
                } else {
                    string = lang.list["overrides"][string];
                }
            }
        }
        
        var iter = 0;

        while (string.includes("%") && iter < 1000) {
            if (replacements[iter] instanceof Date) {
                string = string.replace("%", replacements[iter].toLocaleTimeString(useLocaleFormats ? lang.lang : "en-GB", {hour: "2-digit", minute: "2-digit"}));    
            } else if (!!Number(replacements[iter]) && useLocaleFormats) {
                string = string.replace("%", Number(replacements[iter]).toLocaleString(lang.lang));
            } else {
                string = string.replace("%", replacements[iter]);
            }

            iter++;
        }

        return string;
    },

    translogToJSObj: function() {
        var stringBuilder = `lang.list[""] = {`;

        for (var i = 0; i < lang.translog.length; i++) {
            stringBuilder += `\n    "` + lang.translogErrors[i].replace(/"/g, "\\\"").replace(/\\/g, "\\\\") + `": "",`
        }

        stringBuilder = stringBuilder.substring(0, stringBuilder.length - 1);
        stringBuilder += "\n};";

        return stringBuilder;
    },

    translogErrorsToJSSnippet: function() {
        var stringBuilder = "";

        for (var i = 0; i < lang.translogErrors.length; i++) {
            stringBuilder += `\n    "` + lang.translogErrors[i].replace(/"/g, "\\\"").replace(/\\/g, "\\\\") + `": "",`
        }

        stringBuilder = stringBuilder.substring(0, stringBuilder.length - 1);

        return stringBuilder;
    },

    getStats: function() {
        if (lang.lang == lang.defaultLang) {
            console.log("Please switch to a language other than " + lang.lang + "!");
        } else {
            console.log("Statistics for " + lang.lang + ":");
            console.log("Available strings:         " + Object.keys(lang.list[lang.lang]).length);
            console.log("Currently used strings:    " + lang.translog.length);
            console.log("Missing strings:           " + lang.translogErrors.length);
            console.log("Translated:                " + (((lang.translog.length - lang.translogErrors.length) / lang.translog.length) * 100) + "%");
        }
    }
};

function _(string, replacements = []) {
    return lang.translate(string, replacements);
}

$(function() {
    setInterval(function() {
        $("*:not(script, style, meta, link, .noTranslate)").each(function() {
            if ($(this).html().trim()[0] == "@") {
                if ($(this).html().substring(1).split("|").length == 2) {
                    $(this).html(lang.translate(
                        $(this).html().trim().substring(1).split("|")[0],
                        $(this).html().trim().substring(1).split("|")[1].split("\\")
                    ));
                } else {
                    $(this).html(lang.translate(
                        $(this).html().trim().substring(1).split("|")[0]
                    ));
                }
            }

            var thisParent = this;

            $.each(this.attributes, function(index, element) {
                if ($(thisParent).attr(element.name)[0] == "@") {
                    if ($(thisParent).attr(element.name).substring(1).split("|").length == 2) {
                        $(thisParent).attr(element.name, lang.translate(
                            $(thisParent).attr(element.name).substring(1).split("|")[0],
                            $(thisParent).attr(element.name).substring(1).split("|")[1].split("\\")
                        ));
                    } else {
                        $(thisParent).attr(element.name, lang.translate(
                            $(thisParent).attr(element.name).substring(1).split("|")[0]
                        ));
                    }
                }
            });
        });
    }, 10);
});

if (getURLParameter("lang") != null) {
    lang.lang = getURLParameter("lang");
} else {
    if (navigator.languages != undefined) {
        lang.lang = navigator.languages[0];
    } else {
        lang.lang = navigator.language;
    }
}

lang.realLang = lang.lang;

if ((lang.lang == "en-AU" || lang.lang == "en-US") && lang.list[lang.lang] == undefined) {
    lang.lang = "en-GB";
}